package repositories

import (
	"errors"
	"fmt"
	"strings"

	"github.com/gobeam/stringy"
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

func (identityRepository *IdentityRepository) CreateUser(user *models.User) *models.User {
	result := identityRepository.defaultDB.Create(user)
	if result.Error != nil {
		panic(result.Error)
	}
	return user
}

func (identityRepository *IdentityRepository) GetUserByUsername(username string) *models.User {
	var user models.User

	result := identityRepository.defaultDB.Model(&models.User{}).Where("LOWER(email) = LOWER(?) OR LOWER(phone_number) = LOWER(?)", username, username).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil
		}
		panic(result.Error)
	}

	return &user
}

func (identityRepository *IdentityRepository) CheckIfUsernameExists(username string) bool {
	var count int64
	result := identityRepository.defaultDB.Model(&models.User{}).Where("LOWER(email) = LOWER(?) OR LOWER(phone_number) = LOWER(?)", username, username).Count(&count)

	if result.Error != nil {
		panic(result.Error)
	}

	return count > 0
}

func (identityRepository *IdentityRepository) CheckIfNameExists(username string) bool {
	var count int64
	result := identityRepository.defaultDB.Model(&models.User{}).Where("LOWER(user_name) = LOWER(?)", username).Count(&count)

	if result.Error != nil {
		panic(result.Error)
	}

	return count > 0
}

func (identityRepository *IdentityRepository) GenerateName(names ...string) string {
	if len(names) == 0 || names[0] == "" {
		panic("at least one name is required")
	}

	// Combine all non-empty names with a space for initial formatting
	var combinedParts []string
	for _, name := range names {
		if name != "" {
			combinedParts = append(combinedParts, name)
		}
	}

	if len(combinedParts) == 0 {
		panic("at least one non-empty name is required")
	}

	baseName := strings.Join(combinedParts, " ")

	count := 1
	var userName string

	for {
		var nameWithCount string
		if count == 1 {
			nameWithCount = baseName
		} else {
			nameWithCount = fmt.Sprintf("%s %d", baseName, count)
		}

		slug := stringy.New(nameWithCount).SnakeCase().ToLower()
		userName = strings.ReplaceAll(slug, "_", "-")

		if !identityRepository.CheckIfNameExists(userName) {
			break
		}

		count++
	}

	return userName
}
