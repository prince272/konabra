package services

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/prince272/konabra/internal/helpers"
	models "github.com/prince272/konabra/internal/models/identity"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/pkg/problems"
	"github.com/prince272/konabra/utils"
	"go.uber.org/zap"
)

type CreateAccountForm struct {
	FirstName string `json:"firstName" validate:"required,max=256"`
	LastName  string `json:"lastName" validate:"required,max=256"`
	Username  string `json:"username" validate:"required,max=256,username"`
	Password  string `json:"password" validate:"required,password"`
}

type SignInForm struct {
	Username string `json:"username" validate:"required,max=256,username"`
	Password string `json:"password" validate:"required"`
}

func (form CreateAccountForm) GetEmail() string {
	if helpers.IsEmail(form.Username) {
		return form.Username
	}
	return ""
}

func (form CreateAccountForm) GetPhoneNumber() string {
	if helpers.IsPhoneNumber(form.Username) {
		return form.Username
	}
	return ""
}

type AccountModel struct {
	FirstName           string    `json:"firstName"`
	LastName            string    `json:"lastName"`
	UserName            string    `json:"userName"`
	Email               string    `json:"email"`
	EmailVerified       bool      `json:"emailVerified"`
	PhoneNumber         string    `json:"phoneNumber"`
	PhoneNumberVerified bool      `json:"phoneNumberVerified"`
	HasPassword         bool      `json:"hasPassword"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
	LastActiveAt        time.Time `json:"lastActiveAt"`
	Roles               []string  `json:"roles"`
}

type AccountWithTokenModel struct {
	AccountModel
	helpers.JwtTokenModel
}

type IdentityService struct {
	identityRepository *repositories.IdentityRepository
	jwtHelper          *helpers.JwtHelper
	validationHelper   *helpers.ValidationHelper
	logger             *zap.Logger
}

func NewIdentityService(
	identityRepository *repositories.IdentityRepository,
	validationHelper *helpers.ValidationHelper,
	jwtHelper *helpers.JwtHelper, logger *zap.Logger) *IdentityService {
	return &IdentityService{
		identityRepository,
		jwtHelper,
		validationHelper,
		logger,
	}
}

func (service *IdentityService) CreateAccount(form CreateAccountForm) (*AccountModel, *problems.Problem) {

	// Validate form
	if err := service.validationHelper.ValidateStruct(form); err != nil {
		service.logger.Error("Validation error: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	// Check if username exists
	if usernameExists := service.identityRepository.UsernameExists(form.Username); usernameExists {
		return nil, problems.NewValidationProblem(map[string]string{"username": "Username already exists."})
	}

	currentTime := time.Now()

	user := &models.User{
		Id:                  uuid.New().String(),
		FirstName:           form.FirstName,
		LastName:            form.LastName,
		Email:               form.GetEmail(),
		EmailVerified:       false,
		PhoneNumber:         form.GetPhoneNumber(),
		PhoneNumberVerified: false,
		UserName:            service.identityRepository.GenerateName(form.FirstName, form.LastName),
		PasswordHash:        utils.MustHashPassword(form.Password),
		HasPassword:         true,
		SecurityStamp:       uuid.New().String(),
		CreatedAt:           currentTime,
		UpdatedAt:           currentTime,
		LastActiveAt:        currentTime,
	}

	roles, err := service.identityRepository.EnsureRoleExists("Administrator", "Member")

	if err != nil {
		service.logger.Error("Error ensuring roles exist: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	if err := service.identityRepository.CreateUser(user); err != nil {
		service.logger.Error("Error creating user: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	if err := service.identityRepository.AddUserToRoles(user, roles...); err != nil {
		service.logger.Error("Error adding user to roles: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	model := &AccountModel{}

	if err := copier.Copy(model, user); err != nil {
		service.logger.Error("Error copying user to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	model.Roles = user.RoleNames()
	return model, nil
}

func (service *IdentityService) SignInAccount(form SignInForm) (*AccountWithTokenModel, *problems.Problem) {

	// Validate form
	if err := service.validationHelper.ValidateStruct(form); err != nil {
		service.logger.Error("Validation error: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	// Check if username exists
	var user *models.User
	if user = service.identityRepository.FindUserByUsername(form.Username); user == nil {
		service.logger.Error("User not found: ", zap.String("username", form.Username))
		return nil, problems.NewValidationProblem(map[string]string{"username": "Username does not exist."})
	}

	// Check if password is correct
	if !utils.CheckPasswordHash(form.Password, user.PasswordHash) {
		service.logger.Error("Incorrect password for user: ", zap.String("username", form.Username))
		return nil, problems.NewValidationProblem(map[string]string{"password": "Password is incorrect."})
	}

	if err := service.jwtHelper.RevokeExpiredTokens(user.Id); err != nil {
		service.logger.Error("Error revoking expired tokens: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	// Create JWT token
	token, err := service.jwtHelper.CreateToken(user.Id, map[string]any{
		"email":       user.Email,
		"phoneNumber": user.PhoneNumber,
		"roles":       user.RoleNames(),
	})

	if err != nil {
		service.logger.Error("Error creating JWT token: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	model := &AccountWithTokenModel{}

	if err := copier.Copy(model, user); err != nil {
		service.logger.Error("Error copying user to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	if err := copier.Copy(model, token); err != nil {
		service.logger.Error("Error copying token to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	model.Roles = user.RoleNames()
	return model, nil
}

func (service *IdentityService) GetAccountById(id string) (*AccountModel, *problems.Problem) {
	user := service.identityRepository.FindUserById(id)

	if user == nil {
		service.logger.Error("User not found: ", zap.String("id", id))
		return nil, problems.NewProblem(http.StatusNotFound, "User not found.")
	}

	model := &AccountModel{}

	if err := copier.Copy(model, user); err != nil {
		service.logger.Error("Error copying user to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	model.Roles = user.RoleNames()
	return model, nil
}
