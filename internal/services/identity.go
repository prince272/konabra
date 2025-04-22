package services

import (
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/pkg/di"
)

type CreateAccountForm struct {
	FirstName string `json:"firstName" validate:"required,max=256"`
	LastName  string `json:"lastName" validate:"required,max=256"`
	Username  string `json:"username" validate:"required,max=256"`
	Password  string `json:"password" validate:"required,password"`
}

type IdentityService struct {
	identityRepository *repositories.IdentityRepository
}

func NewIdentityService(container *di.Container) *IdentityService {
	identityRepository := di.MustGet[*repositories.IdentityRepository](container)
	return &IdentityService{
		identityRepository,
	}
}

func (identityService *IdentityService) CreateAccount() {

}
