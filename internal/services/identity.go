package services

import (
	"github.com/go-playground/validator/v10"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/pkg/di"
	"github.com/prince272/konabra/pkg/problems"
)

type CreateAccountForm struct {
	FirstName string `json:"firstName" validate:"required,max=256"`
	LastName  string `json:"lastName" validate:"required,max=256"`
	Username  string `json:"username" validate:"required,max=256"`
	Password  string `json:"password" validate:"required,password"`
}

type CreateAccountData struct {
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

func (identityService *IdentityService) CreateAccount(form *CreateAccountForm) (data *CreateAccountData, problem *problems.Problem) {
	if err := identityService.validate.Struct(form); err != nil {
		return nil, problems.NewValidationProblem(err)
	}

	return nil, nil
}
