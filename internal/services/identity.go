package services

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/prince272/konabra/internal/helpers"
	models "github.com/prince272/konabra/internal/models"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/pkg/humanize"
	"github.com/prince272/konabra/pkg/otp"
	"github.com/prince272/konabra/utils"
	"go.uber.org/zap"
)

type CreateAccountForm struct {
	FirstName    string `json:"firstName" validate:"required,max=256"`
	LastName     string `json:"lastName" validate:"required,max=256"`
	Username     string `json:"username" validate:"required,max=256,username"`
	Password     string `json:"password" validate:"required,password"`
	ValidateOnly bool   `json:"validateOnly"`
}

type SignInForm struct {
	Username string `json:"username" validate:"required,max=256,username"`
	Password string `json:"password" validate:"required"`
}

type SignInWithRefreshTokenForm struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type SignOutForm struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
	Global       bool   `json:"global"`
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
	Id                    string    `json:"id"`
	FirstName             string    `json:"firstName"`
	LastName              string    `json:"lastName"`
	FullName              string    `json:"fullName"`
	UserName              string    `json:"userName"`
	Email                 string    `json:"email"`
	EmailVerified         bool      `json:"emailVerified"`
	PhoneNumber           string    `json:"phoneNumber"`
	PhoneNumberVerified   bool      `json:"phoneNumberVerified"`
	HasPassword           bool      `json:"hasPassword"`
	LastPasswordChangedAt time.Time `json:"lastPasswordChangedAt"`
	CreatedAt             time.Time `json:"createdAt"`
	UpdatedAt             time.Time `json:"updatedAt"`
	LastActiveAt          time.Time `json:"lastActiveAt"`
	Roles                 []string  `json:"roles"`
	PrimaryRole           string    `json:"primaryRole"`
}

type AccountWithTokenModel struct {
	AccountModel
	helpers.JwtTokenModel
}

type VerifyAccountForm struct {
	Username string `json:"username" validate:"required,max=256,username"`
}

type CompleteVerifyAccountForm struct {
	VerifyAccountForm
	Code string `json:"code" validate:"required"`
}

type ChangeAccountForm struct {
	NewUsername string `json:"newUsername" validate:"required,max=256,username"`
}

type CompleteChangeAccountForm struct {
	ChangeAccountForm
	Code string `json:"code" validate:"required"`
}

type ResetPasswordForm struct {
	Username string `json:"username" validate:"required,max=256,username"`
}

type CompleteResetPasswordForm struct {
	ResetPasswordForm
	Code         string `json:"code" validate:"required"`
	NewPassword  string `json:"newPassword" validate:"required,password"`
	ValidateOnly bool   `json:"validateOnly"`
}

type ChangePasswordForm struct {
	OldPassword string `json:"oldPassword" validate:"required"`
	NewPassword string `json:"newPassword" validate:"required,password"`
}

type AccountType string

const (
	AccountTypeEmail       AccountType = "Email"
	AccountTypePhoneNumber AccountType = "PhoneNumber"
	AccountTypeUnknown     AccountType = "Unknown"
)

func GetAccountType(input string) AccountType {
	if helpers.IsEmail(input) {
		return AccountTypeEmail
	}
	if helpers.IsPhoneNumber(input) {
		return AccountTypePhoneNumber
	}
	return AccountTypeUnknown
}

const (
	PurposeVerifyAccount = "VerifyAccount"
	PurposeChangeAccount = "ChangeAccount"
	PurposeResetPassword = "ResetPassword"
)

type IdentityService struct {
	identityRepository *repositories.IdentityRepository
	jwtHelper          *helpers.JwtHelper
	validator          *helpers.Validator
	state              *helpers.State
	logger             *zap.Logger
}

func NewIdentityService(
	identityRepository *repositories.IdentityRepository,
	jwtHelper *helpers.JwtHelper,
	validator *helpers.Validator,
	state *helpers.State,
	logger *zap.Logger) *IdentityService {
	return &IdentityService{
		identityRepository,
		jwtHelper,
		validator,
		state,
		logger,
	}
}

func (service *IdentityService) CreateAccount(form CreateAccountForm) (*AccountWithTokenModel, *problems.Problem) {

	// Validate form
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	accountType := GetAccountType(form.Username)
	if usernameExists := service.identityRepository.UsernameExists(form.Username); usernameExists {
		return nil, problems.NewValidationProblem(map[string]string{"username": fmt.Sprintf("%v already exists.", humanize.Humanize(string(accountType), humanize.SentenceCase))})
	}

	if form.ValidateOnly {
		return nil, nil
	}

	currentTime := time.Now()

	user := &models.User{
		Id:                    uuid.New().String(),
		FirstName:             form.FirstName,
		LastName:              form.LastName,
		Email:                 form.GetEmail(),
		EmailVerified:         false,
		PhoneNumber:           form.GetPhoneNumber(),
		PhoneNumberVerified:   false,
		UserName:              service.identityRepository.GenerateUserName(form.FirstName, form.LastName),
		PasswordHash:          utils.MustHashPassword(form.Password),
		HasPassword:           true,
		SecurityStamp:         uuid.New().String(),
		LastActiveAt:          currentTime,
		LastPasswordChangedAt: currentTime,
	}

	if err := service.identityRepository.CreateUser(user); err != nil {
		service.logger.Error("Error creating user: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	if err := service.identityRepository.AddUserToRoles(user, []string{models.RoleReporter}...); err != nil {
		service.logger.Error("Error adding user to roles: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	// Create JWT token
	token, err := service.jwtHelper.CreateToken(user.Id, map[string]any{
		"email":       user.Email,
		"phoneNumber": user.PhoneNumber,
		"roles":       user.Roles(),
	})

	if err != nil {
		service.logger.Error("Error creating token: ", zap.Error(err))
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

	return model, nil
}

func (service *IdentityService) SignIn(form SignInForm) (*AccountWithTokenModel, *problems.Problem) {

	// Validate form
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	// Check if username exists
	accountType := GetAccountType(form.Username)
	var user *models.User
	if user = service.identityRepository.GetUserByUsername(form.Username); user == nil {
		return nil, problems.NewValidationProblem(map[string]string{"username": fmt.Sprintf("%v does not exist.", humanize.Humanize(string(accountType), humanize.SentenceCase))})
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
		"roles":       user.Roles(),
	})

	if err != nil {
		service.logger.Error("Error creating token: ", zap.Error(err))
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

	return model, nil
}

func (service *IdentityService) SignInWithRefreshToken(form SignInWithRefreshTokenForm) (*AccountWithTokenModel, *problems.Problem) {

	// Validate form
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	// Validate token
	claims, err := service.jwtHelper.VerifyRefreshToken(form.RefreshToken)
	if err != nil {
		return nil, problems.NewValidationProblem(map[string]string{"refreshToken": "Refresh token is invalid."})
	}

	// Lookup user
	user := service.identityRepository.GetUserById(claims["sub"].(string))
	if user == nil {
		return nil, problems.NewValidationProblem(map[string]string{"refreshToken": "User not found."})
	}

	// Revoke token
	if err := service.jwtHelper.RevokeToken(user.Id, form.RefreshToken); err != nil {
		service.logger.Error("Error revoking token: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	// Create new token
	token, err := service.jwtHelper.CreateToken(user.Id, map[string]any{
		"email":       user.Email,
		"phoneNumber": user.PhoneNumber,
		"roles":       user.Roles(),
	})

	if err != nil {
		service.logger.Error("Error creating token: ", zap.Error(err))
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

	return model, nil
}

func (service *IdentityService) SignOut(userId string, form SignOutForm) *problems.Problem {
	// Validate form
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	if form.Global {
		if err := service.jwtHelper.RevokeAllTokens(userId); err != nil {
			service.logger.Error("Error revoking all tokens: ", zap.Error(err))
			return problems.FromError(err)
		}
	} else {
		if err := service.jwtHelper.RevokeToken(userId, form.RefreshToken); err != nil {
			service.logger.Error("Error revoking token: ", zap.Error(err))
			return problems.FromError(err)
		}
	}

	return nil
}

func (service *IdentityService) GetAccountByUserId(userId string) (*AccountModel, *problems.Problem) {
	user := service.identityRepository.GetUserById(userId)

	if user == nil {
		return nil, problems.NewProblem(http.StatusNotFound, "User not found.")
	}

	model := &AccountModel{}

	if err := copier.Copy(model, user); err != nil {
		service.logger.Error("Error copying user to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	return model, nil
}

func (service *IdentityService) VerifyAccount(form VerifyAccountForm) *problems.Problem {
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	accountType := GetAccountType(form.Username)
	user := service.identityRepository.GetUserByUsername(form.Username)
	if user == nil {
		return problems.NewValidationProblem(map[string]string{"username": fmt.Sprintf("%v does not exist.", humanize.Humanize(string(accountType), humanize.SentenceCase))})
	}

	secret := fmt.Sprintf("%v-%v-%v", user.Id, PurposeVerifyAccount, user.SecurityStamp)

	tp, err := otp.NewCodeProvider(secret)
	if err != nil {
		service.logger.Error("Code provider error: ", zap.Error(err))
		return problems.FromError(err)
	}

	code, err := tp.GenerateCode()

	if err != nil {
		service.logger.Error("Code generation error: ", zap.Error(err))
		return problems.FromError(err)
	}

	if accountType == AccountTypeEmail {
		service.logger.Debug("Email verification code: " + code)

	} else if accountType == AccountTypePhoneNumber {
		service.logger.Debug("Phone verification code: " + code)
	} else {
		return problems.NewValidationProblem(map[string]string{"username": "Username is not a valid email or phone number."})
	}

	return nil
}

func (service *IdentityService) CompleteVerifyAccount(form CompleteVerifyAccountForm) *problems.Problem {
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	accountType := GetAccountType(form.Username)
	user := service.identityRepository.GetUserByUsername(form.Username)
	if user == nil {
		return problems.NewValidationProblem(map[string]string{"username": fmt.Sprintf("%v does not exist.", humanize.Humanize(string(accountType), humanize.SentenceCase))})
	}

	secret := fmt.Sprintf("%v-%v-%v", user.Id, PurposeVerifyAccount, user.SecurityStamp)

	tp, err := otp.NewCodeProvider(secret)
	if err != nil {
		service.logger.Error("Code provider error: ", zap.Error(err))
		return problems.FromError(err)
	}

	valid, err := tp.ValidateCode(form.Code)

	if err != nil {
		service.logger.Error("Code validation error: ", zap.Error(err))
		return problems.FromError(err)
	}
	if !valid {
		return problems.NewValidationProblem(map[string]string{"code": "Verification code is invalid."})
	}

	if accountType == AccountTypeEmail {
		user.EmailVerified = true
	} else if accountType == AccountTypePhoneNumber {
		user.PhoneNumberVerified = true

	} else {
		return problems.NewValidationProblem(map[string]string{"username": "Username is not a valid email or phone number."})
	}

	user.SecurityStamp = uuid.New().String()
	user.UpdatedAt = time.Now()

	if err := service.identityRepository.UpdateUser(user); err != nil {
		service.logger.Error("User update error: ", zap.Error(err))
		return problems.FromError(err)
	}

	return nil
}

func (service *IdentityService) DeleteAccount(userId string) *problems.Problem {
	user := service.identityRepository.GetUserById(userId)

	if user == nil {
		return problems.NewProblem(http.StatusNotFound, "User not found.")
	}

	if err := service.identityRepository.DeleteUser(user); err != nil {
		service.logger.Error("User deletion error: ", zap.Error(err))
		return problems.FromError(err)
	}

	return nil
}

func (service *IdentityService) ChangeAccount(userId string, form ChangeAccountForm) *problems.Problem {
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	accountType := GetAccountType(form.NewUsername)
	user := service.identityRepository.GetUserById(userId)

	if user == nil {
		return problems.NewProblem(http.StatusNotFound, "User not found.")
	}

	if user.Email == form.NewUsername || user.PhoneNumber == form.NewUsername {
		return problems.NewValidationProblem(map[string]string{
			"newUsername": fmt.Sprintf("%v is already associated with your account.", humanize.Humanize(string(accountType), humanize.SentenceCase)),
		})
	}

	secret := fmt.Sprintf("%v-%v-%v-%v", user.Id, PurposeChangeAccount, user.SecurityStamp, form.NewUsername)

	tp, err := otp.NewCodeProvider(secret)
	if err != nil {
		service.logger.Error("Code provider error: ", zap.Error(err))
		return problems.FromError(err)
	}

	code, err := tp.GenerateCode()

	if err != nil {
		service.logger.Error("Code generation error: ", zap.Error(err))
		return problems.FromError(err)
	}

	if accountType == AccountTypeEmail {
		service.logger.Debug("Email change verification code: " + code)
	} else if accountType == AccountTypePhoneNumber {
		service.logger.Debug("Phone change verification code: " + code)
	} else {
		return problems.NewValidationProblem(map[string]string{"username": "Username is not a valid email or phone number."})
	}

	return nil
}

func (service *IdentityService) CompleteChangeAccount(userId string, form CompleteChangeAccountForm) *problems.Problem {
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	accountType := GetAccountType(form.NewUsername)
	user := service.identityRepository.GetUserById(userId)

	if user == nil {
		return problems.NewProblem(http.StatusNotFound, "User not found.")
	}

	if user.Email == form.NewUsername || user.PhoneNumber == form.NewUsername {
		return problems.NewValidationProblem(map[string]string{"newUsername": fmt.Sprintf("%v is already verified.", humanize.Humanize(string(accountType), humanize.SentenceCase))})
	}

	secret := fmt.Sprintf("%v-%v-%v-%v", user.Id, PurposeChangeAccount, user.SecurityStamp, form.NewUsername)

	tp, err := otp.NewCodeProvider(secret)
	if err != nil {
		service.logger.Error("Code provider error: ", zap.Error(err))
		return problems.FromError(err)
	}

	valid, err := tp.ValidateCode(form.Code)
	if err != nil {
		service.logger.Error("Code validation error: ", zap.Error(err))
		return problems.FromError(err)
	}
	if !valid {
		return problems.NewValidationProblem(map[string]string{"code": "Verification code is invalid."})
	}

	if accountType == AccountTypeEmail {
		user.Email = form.NewUsername
		user.EmailVerified = true

	} else if accountType == AccountTypePhoneNumber {
		user.PhoneNumber = form.NewUsername
		user.PhoneNumberVerified = true

	} else {
		return problems.NewValidationProblem(map[string]string{"newUsername": "Username is not a valid email or phone number."})
	}

	user.SecurityStamp = uuid.New().String()
	user.UpdatedAt = time.Now()

	if err := service.identityRepository.UpdateUser(user); err != nil {
		service.logger.Error("User update error: ", zap.Error(err))
		return problems.FromError(err)
	}

	return nil
}

func (service *IdentityService) ResetPassword(form ResetPasswordForm) *problems.Problem {
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	accountType := GetAccountType(form.Username)
	user := service.identityRepository.GetUserByUsername(form.Username)

	if user == nil {
		return problems.NewValidationProblem(map[string]string{"username": fmt.Sprintf("%v does not exist.", humanize.Humanize(string(accountType), humanize.SentenceCase))})
	}

	secret := fmt.Sprintf("%v-%v-%v", user.Id, PurposeResetPassword, user.SecurityStamp)

	tp, err := otp.NewCodeProvider(secret)
	if err != nil {
		service.logger.Error("Code provider error: ", zap.Error(err))
		return problems.FromError(err)
	}

	code, err := tp.GenerateCode()
	if err != nil {
		service.logger.Error("Code generation error: ", zap.Error(err))
		return problems.FromError(err)
	}

	if accountType == AccountTypeEmail {
		service.logger.Debug("Email reset password code: " + code)
	} else if accountType == AccountTypePhoneNumber {

		service.logger.Debug("Phone reset password code: " + code)
	} else {
		return problems.NewValidationProblem(map[string]string{"username": "Username is not a valid email or phone number."})
	}

	return nil
}

func (service *IdentityService) CompleteResetPassword(form CompleteResetPasswordForm) *problems.Problem {
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	accountType := GetAccountType(form.Username)
	user := service.identityRepository.GetUserByUsername(form.Username)

	if user == nil {
		return problems.NewValidationProblem(map[string]string{"username": fmt.Sprintf("%v does not exist.", humanize.Humanize(string(accountType), humanize.SentenceCase))})
	}

	secret := fmt.Sprintf("%v-%v-%v", user.Id, PurposeResetPassword, user.SecurityStamp)

	tp, err := otp.NewCodeProvider(secret)
	if err != nil {
		service.logger.Error("Code provider error: ", zap.Error(err))
		return problems.FromError(err)
	}

	valid, err := tp.ValidateCode(form.Code)

	if err != nil {
		service.logger.Error("Code validation error: ", zap.Error(err))
		return problems.FromError(err)
	}
	if !valid {
		return problems.NewValidationProblem(map[string]string{"code": "Verification code is invalid."})
	}

	if form.ValidateOnly {
		return nil
	}

	user.HasPassword = true
	user.PasswordHash = utils.MustHashPassword(form.NewPassword)
	user.SecurityStamp = uuid.New().String()
	user.UpdatedAt = time.Now()
	user.LastPasswordChangedAt = time.Now()

	if err := service.identityRepository.UpdateUser(user); err != nil {
		service.logger.Error("User update error: ", zap.Error(err))
		return problems.FromError(err)
	}

	return nil
}

func (service *IdentityService) ChangePassword(userId string, form ChangePasswordForm) *problems.Problem {
	if err := service.validator.ValidateStruct(form); err != nil {
		return problems.FromError(err)
	}

	user := service.identityRepository.GetUserById(userId)

	if user == nil {
		return problems.NewProblem(http.StatusNotFound, "User not found.")
	}

	if !utils.CheckPasswordHash(form.OldPassword, user.PasswordHash) {
		return problems.NewValidationProblem(map[string]string{"oldPassword": "Old password is incorrect."})
	}

	user.HasPassword = true
	user.PasswordHash = utils.MustHashPassword(form.NewPassword)
	user.SecurityStamp = uuid.New().String()
	user.UpdatedAt = time.Now()
	user.LastPasswordChangedAt = time.Now()

	if err := service.identityRepository.UpdateUser(user); err != nil {
		service.logger.Error("User update error: ", zap.Error(err))
		return problems.FromError(err)
	}

	return nil
}
