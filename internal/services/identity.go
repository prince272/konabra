package services

import (
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/pkg/di"
)

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
