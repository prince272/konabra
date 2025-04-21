package repositories

import (
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
