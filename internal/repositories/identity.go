package repositories

import (
	"errors"
	"fmt"
	"strings"

	"github.com/gobeam/stringy"
	"github.com/google/uuid"
	"github.com/prince272/konabra/internal/builds"
	models "github.com/prince272/konabra/internal/models/identity"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type IdentityRepository struct {
	defaultDB *builds.DefaultDB
	logger    *zap.Logger
}

func NewIdentityRepository(logger *zap.Logger, defaultDB *builds.DefaultDB) *IdentityRepository {
	return &IdentityRepository{
		defaultDB: defaultDB,
		logger:    logger,
	}
}

func (repository *IdentityRepository) CreateUser(user *models.User) error {
	result := repository.defaultDB.Create(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *IdentityRepository) UpdateUser(user *models.User) error {
	result := repository.defaultDB.Save(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *IdentityRepository) FindUserByUsername(username string) *models.User {
	user := &models.User{}

	result := repository.defaultDB.Model(&models.User{}).Preload("Roles").
		Where("LOWER(email) = LOWER(?) OR LOWER(phone_number) = LOWER(?)", username, username).
		First(user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil
		}

		panic(fmt.Errorf("failed to find user by username: %w", result.Error))
	}

	return user
}

func (repository *IdentityRepository) FindUserById(id string) *models.User {
	user := &models.User{}
	result := repository.defaultDB.Model(&models.User{}).Preload("Roles").
		Where("id = ?", id).
		First(user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil
		}

		panic(fmt.Errorf("failed to find user by id: %w", result.Error))
	}

	return user
}

func (repository *IdentityRepository) UsernameExists(username string) bool {
	var count int64
	result := repository.defaultDB.Model(&models.User{}).
		Where("LOWER(email) = LOWER(?) OR LOWER(phone_number) = LOWER(?)", username, username).
		Count(&count)

	if result.Error != nil {
		panic(fmt.Errorf("failed to check if username exists: %w", result.Error))
	}

	return count > 0
}

func (repository *IdentityRepository) NameExists(name string) bool {
	var count int64
	result := repository.defaultDB.Model(&models.User{}).
		Where("LOWER(user_name) = LOWER(?)", name).
		Count(&count)

	if result.Error != nil {
		panic(fmt.Errorf("failed to check if name exists: %w", result.Error))
	}

	return count > 0
}

func (repository *IdentityRepository) GenerateName(names ...string) string {
	var combinedParts []string
	for _, name := range names {
		if name != "" {
			combinedParts = append(combinedParts, name)
		}
	}

	baseName := "user"
	if len(combinedParts) > 0 {
		baseName = strings.Join(combinedParts, " ")
	}

	count := 1
	var userName string

	for {
		var nameWithCount string
		if count == 1 {
			nameWithCount = baseName
		} else {
			nameWithCount = fmt.Sprintf("%v %d", baseName, count)
		}

		slug := stringy.New(nameWithCount).SnakeCase().ToLower()
		userName = strings.ReplaceAll(slug, "_", "-")

		if !repository.NameExists(userName) {
			break
		}

		count++
	}

	return userName
}

func (repository *IdentityRepository) EnsureRoleExists(roles ...string) ([]*models.Role, error) {
	var resultRoles []*models.Role

	for _, role := range roles {
		var existingRole *models.Role
		// Check if the role already exists
		if err := repository.defaultDB.
			Where("name = ?", role).
			First(&existingRole).Error; err == nil {
			// Role already exists, add to result
			resultRoles = append(resultRoles, existingRole)
			continue
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			// An actual error occurred (not just "not found")
			return nil, err
		}

		// Role does not exist, so create it
		roleModel := &models.Role{
			Id:   uuid.New().String(),
			Name: role,
		}
		result := repository.defaultDB.Create(roleModel)
		if result.Error != nil {
			return nil, result.Error
		}
		// Add the newly created role to the result
		resultRoles = append(resultRoles, roleModel)
	}
	return resultRoles, nil
}

func (repository *IdentityRepository) AddUserToRoles(user *models.User, roles ...*models.Role) error {
	for _, role := range roles {
		if err := repository.defaultDB.Model(user).Association("Roles").Append(role); err != nil {
			return fmt.Errorf("failed to add user to role: %w", err)
		}
	}
	return nil
}
