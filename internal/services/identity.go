package services

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/prince272/konabra/internal/helpers"
	models "github.com/prince272/konabra/internal/models/identity"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/internal/repositories"
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
	if !helpers.MaybePhoneOrEmail(form.Username) {
		return form.Username
	}
	return ""
}

func (form CreateAccountForm) GetPhoneNumber() string {
	if helpers.MaybePhoneOrEmail(form.Username) {
		return form.Username
	}
	return ""
}

type AccountModel struct {
	Id                  string    `json:"id"`
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

type AccountVerificationForm struct {
	Username string `json:"username" validate:"required,max=256,username"`
}

type CompleteAccountVerificationForm struct {
	AccountVerificationForm
	Code string `json:"code" validate:"required"`
}

type IdentityService struct {
	identityRepository *repositories.IdentityRepository
	jwtHelper          *helpers.JwtHelper
	protector          *helpers.Protector
	validator          *helpers.Validator
	state              *helpers.State
	logger             *zap.Logger
}

func NewIdentityService(
	identityRepository *repositories.IdentityRepository,
	jwtHelper *helpers.JwtHelper,
	protector *helpers.Protector,
	validator *helpers.Validator,
	state *helpers.State,
	logger *zap.Logger) *IdentityService {
	return &IdentityService{
		identityRepository,
		jwtHelper,
		protector,
		validator,
		state,
		logger,
	}
}

func (service *IdentityService) CreateAccount(form CreateAccountForm) (*AccountModel, *problems.Problem) {

	// Validate form
	if err := service.validator.ValidateStruct(form); err != nil {
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
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	// Check if username exists
	var user *models.User
	if user = service.identityRepository.FindUserByUsername(form.Username); user == nil {
		return nil, problems.NewValidationProblem(map[string]string{"username": "Username does not exist."})
	}

	// Check if password is correct
	if !utils.CheckPasswordHash(form.Password, user.PasswordHash) {
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

func (service *IdentityService) GetAccountByUserId(userId string) (*AccountModel, *problems.Problem) {
	user := service.identityRepository.FindUserById(userId)

	if user == nil {
		return nil, problems.NewProblem(http.StatusNotFound, "User was not found.")
	}

	model := &AccountModel{}

	if err := copier.Copy(model, user); err != nil {
		service.logger.Error("Error copying user to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	model.Roles = user.RoleNames()
	return model, nil
}

var (
	AccountVerificationPurpose = "AccountVerification"
)

func (service *IdentityService) SendAccountVerification(form AccountVerificationForm) *problems.Problem {
	// Validate form
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	// Lookup user & determine contact type
	isPhone := helpers.MaybePhoneOrEmail(form.Username)
	user := service.identityRepository.FindUserByUsername(form.Username)
	if user == nil {
		errorMessage := map[bool]string{true: "Phone number was not found.", false: "Email was not found."}[isPhone]
		return problems.NewValidationProblem(map[string]string{"username": errorMessage})
	}

	// Build shared metadata & key
	metadata := map[string]string{"id": user.Id, "securityStamp": user.SecurityStamp, "purpose": AccountVerificationPurpose}
	signatureKey := fmt.Sprintf("%s-%s-%s", user.Id, user.SecurityStamp, AccountVerificationPurpose)

	if isPhone {
		ttl := 10 * time.Minute
		code, err := service.protector.GenerateShortCode("numeric", 6, ttl, metadata)
		if err != nil {
			service.logger.Error("Error generating short code: ", zap.Error(err))
			return problems.FromError(err)
		}
		service.state.SetItem(signatureKey, code.Signature, ttl)
		// TODO: send SMS
	} else {
		ttl := 30 * time.Minute
		token, err := service.protector.GenerateToken(ttl, metadata)
		if err != nil {
			service.logger.Error("Error generating token: ", zap.Error(err))
			return problems.FromError(err)
		}
		service.state.SetItem(signatureKey, token.Signature, ttl)
		// TODO: send email
	}

	return nil
}

func (service *IdentityService) CompleteAccountVerification(form CompleteAccountVerificationForm) *problems.Problem {
	// Validate form
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	// Lookup user & determine contact type
	isPhone := helpers.MaybePhoneOrEmail(form.Username)
	user := service.identityRepository.FindUserByUsername(form.Username)

	if user == nil {
		errorMessage := map[bool]string{true: "Phone number was not found.", false: "Email was not found."}[isPhone]
		return problems.NewValidationProblem(map[string]string{"username": errorMessage})
	}

	// Reconstruct key
	signatureKey := fmt.Sprintf("%s-%s-%s", user.Id, user.SecurityStamp, AccountVerificationPurpose)
	signature, _ := service.state.PopItem(signatureKey).(string)

	// Verify code/token and update user
	if isPhone {

		if _, err := service.protector.VerifyShortCode(signature, form.Code); err != nil {
			return problems.NewValidationProblem(map[string]string{"code": "Code is incorrect."})
		}

		user.PhoneNumberVerified = true
	} else {

		if _, err := service.protector.VerifyToken(signature, form.Code); err != nil {
			return problems.NewValidationProblem(map[string]string{"code": "Code is incorrect."})
		}

		user.EmailVerified = true
	}

	user.SecurityStamp = uuid.New().String()

	if err := service.identityRepository.UpdateUser(user); err != nil {
		service.logger.Error("Error updating user: ", zap.Error(err))
		return problems.FromError(err)
	}

	return nil
}
