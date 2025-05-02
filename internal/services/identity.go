package services

import (
	"github.com/go-playground/validator/v10"
	"github.com/jinzhu/copier"
	models "github.com/prince272/konabra/internal/models/identity"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/pkg/di"
	"github.com/prince272/konabra/pkg/problems"
	"github.com/prince272/konabra/utils"
)

type CreateAccountForm struct {
	FirstName string `json:"firstName" validate:"required,max=256"`
	LastName  string `json:"lastName" validate:"required,max=256"`
	Username  string `json:"username" validate:"required,max=256,username"`
	Password  string `json:"password" validate:"required,password"`
}

func (form *CreateAccountForm) GetEmail() string {
	if utils.IsEmail(form.Username) {
		return form.Username
	}
	return ""
}

func (form *CreateAccountForm) GetPhoneNumber() string {
	if utils.IsPhoneNumber(form.Username) {
		return form.Username
	}
	return ""
}

type CreateAccountData struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	UserName    string `json:"userName"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phoneNumber"`
}

type IdentityService struct {
	identityRepository *repositories.IdentityRepository
	validate           *validator.Validate
}

func NewIdentityService(container *di.Container) *IdentityService {
	identityRepository := di.MustGet[*repositories.IdentityRepository](container)
	validate := di.MustGet[*validator.Validate](container)
	return &IdentityService{
		identityRepository,
		validate,
	}
}

func (identityService *IdentityService) CreateAccount(form *CreateAccountForm) (*CreateAccountData, *problems.Problem) {
	// Validate form input
	if err := identityService.validate.Struct(form); err != nil {
		return nil, problems.NewBadRequestProblemFromError(err)
	}

	identityRepository := identityService.identityRepository

	// Check if username exists
	if usernameExists := identityRepository.CheckIfUsernameExists(form.Username); usernameExists {
		return nil, problems.NewBadRequestProblemFromErrors(map[string]string{"username": "Username already exists."})
	}

	user := &models.User{
		FirstName:   form.FirstName,
		LastName:    form.LastName,
		Email:       form.GetEmail(),
		PhoneNumber: form.GetPhoneNumber(),
		UserName:    identityRepository.GenerateName(form.FirstName, form.LastName),
	}

	data := &CreateAccountData{}
	copier.Copy(data, user)

	return data, nil
}
