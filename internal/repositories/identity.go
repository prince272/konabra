package repositories

import (
	models "github.com/prince272/konabra/internal/models/identity"
	"github.com/prince272/konabra/pkg/di"
	"gorm.io/gorm"
)

type IdentityRepository struct {
	defaultDB *gorm.DB
}

func NewIdentityRepository(container *di.Container) *IdentityRepository {
	defaultDB := di.MustGetWithKey[*gorm.DB](container, "DefaultDB")
	return &IdentityRepository{
		defaultDB: defaultDB,
	}
}

func (identityRepository *IdentityRepository) CreateUser(user *models.User) (*models.User, error) {
	result := identityRepository.defaultDB.Create(user)
	if result.Error != nil {
		return nil, result.Error
	}
	return user, nil
}
