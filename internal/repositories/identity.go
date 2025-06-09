package repositories

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/prince272/konabra/internal/builds"
	models "github.com/prince272/konabra/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type IdentityRepository struct {
	defaultDB *builds.DefaultDB
	logger    *zap.Logger
}

type UserFilter struct {
	Sort   string `json:"sort" form:"sort"`
	Order  string `json:"order" form:"order"` // "asc" or "desc"
	Search string `json:"search" form:"search"`
}

type UserPaginatedFilter struct {
	UserFilter
	Offset int `json:"offset" form:"offset"`
	Limit  int `json:"limit" form:"limit"`
}

type RoleFilter struct {
	Sort   string `json:"sort" form:"sort"`
	Order  string `json:"order" form:"order"` // "asc" or "desc"
	Search string `json:"search" form:"search"`
}

type RolePaginatedFilter struct {
	RoleFilter
	Offset int `json:"offset" form:"offset"`
	Limit  int `json:"limit" form:"limit"`
}

func NewIdentityRepository(logger *zap.Logger, defaultDB *builds.DefaultDB) *IdentityRepository {
	return &IdentityRepository{
		defaultDB: defaultDB,
		logger:    logger,
	}
}

func (repository *IdentityRepository) CreateUser(user *models.User) error {
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	result := repository.defaultDB.Create(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *IdentityRepository) UpdateUser(user *models.User) error {
	user.UpdatedAt = time.Now()
	result := repository.defaultDB.Save(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *IdentityRepository) DeleteUser(user *models.User) error {
	result := repository.defaultDB.Delete(user)

	if result.Error != nil {

		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil
		}

		return fmt.Errorf("failed to delete user: %w", result.Error)
	}

	return nil
}

func (repository *IdentityRepository) CreateRole(role *models.Role) error {
	role.CreatedAt = time.Now()
	role.UpdatedAt = time.Now()
	result := repository.defaultDB.Create(role)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *IdentityRepository) UpdateRole(role *models.Role) error {
	role.UpdatedAt = time.Now()
	result := repository.defaultDB.Save(role)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *IdentityRepository) DeleteRole(role *models.Role) error {
	result := repository.defaultDB.Delete(role)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *IdentityRepository) GetUserByUsername(username string) *models.User {
	user := &models.User{}

	result := repository.defaultDB.Model(&models.User{}).Preload("UserRoles").
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

func (repository *IdentityRepository) GetUserById(id string) *models.User {
	user := &models.User{}
	result := repository.defaultDB.Model(&models.User{}).Preload("UserRoles").
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

func (repository *IdentityRepository) UserNameExists(name string) bool {
	var count int64
	result := repository.defaultDB.Model(&models.User{}).
		Where("LOWER(user_name) = LOWER(?)", name).
		Count(&count)

	if result.Error != nil {
		panic(fmt.Errorf("failed to check if name exists: %w", result.Error))
	}

	return count > 0
}

func (repository *IdentityRepository) RoleNameExists(name string) bool {
	var count int64
	result := repository.defaultDB.Model(&models.Role{}).
		Where("LOWER(name) = LOWER(?)", name).
		Count(&count)

	if result.Error != nil {
		panic(fmt.Errorf("failed to check if name exists: %w", result.Error))
	}

	return count > 0
}

func (repository *IdentityRepository) EnsureRoleExists(roleNames ...string) ([]*models.Role, error) {
	var resultRoles []*models.Role

	for _, roleName := range roleNames {
		var existingRole *models.Role
		// Check if the role already exists
		if err := repository.defaultDB.
			Where("name = ?", roleName).
			First(&existingRole).Error; err == nil {
			// Role already exists, add to result
			resultRoles = append(resultRoles, existingRole)
			continue
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			// An actual error occurred (not just "not found")
			return nil, err
		}

		// Role does not exist, so create it
		role := &models.Role{
			Id:   uuid.New().String(),
			Name: roleName,
		}
		result := repository.defaultDB.Create(&role)
		if result.Error != nil {
			return nil, result.Error
		}
		// Add the newly created role to the result
		resultRoles = append(resultRoles, role)
	}
	return resultRoles, nil
}

func (repository *IdentityRepository) AddUserToRoles(user *models.User, roleNames ...string) error {
	roles, err := repository.EnsureRoleExists(roleNames...)
	if err != nil {
		return fmt.Errorf("failed to ensure roles exist: %w", err)
	}

	if err := repository.defaultDB.
		Model(user).
		Association("UserRoles").
		Find(&user.UserRoles); err != nil {
		return fmt.Errorf("failed to load existing roles: %w", err)
	}

	roleMap := make(map[string]*models.Role)
	for _, role := range user.UserRoles {
		roleMap[role.Id] = role
	}
	for _, role := range roles {
		roleMap[role.Id] = role
	}

	distinctRoles := make([]models.Role, 0, len(roleMap))
	for _, role := range roleMap {
		distinctRoles = append(distinctRoles, *role)
	}

	if err := repository.defaultDB.Model(user).Association("UserRoles").Replace(distinctRoles); err != nil {
		return fmt.Errorf("failed to associate roles with user: %w", err)
	}

	return nil
}

func (repository *IdentityRepository) GetPaginatedUsers(filter UserPaginatedFilter) (items []models.User, count int64) {
	query := repository.defaultDB.Model(&models.User{})

	// Apply search filter
	if filter.Search != "" {
		query = query.Where("LOWER(name) LIKE LOWER(?)", "%"+filter.Search+"%")
	}

	allowedSortFields := map[string]string{
		"firstName":    "first_name",
		"lastName":     "last_name",
		"userName":     "user_name",
		"email":        "email",
		"phoneNumber":  "phone_number",
		"createdAt":    "created_at",
		"updatedAt":    "updated_at",
		"lastActiveAt": "last_active_at",
	}

	allowedOrders := map[string]string{
		"asc":  "ASC",
		"desc": "DESC",
	}

	// Default sort settings
	sortField := "createdAt"
	sortOrder := "ASC"

	// Use camelCase filter.Sort and map to actual DB column
	if dbField, ok := allowedSortFields[filter.Sort]; ok {
		sortField = dbField
	}

	if val, ok := allowedOrders[strings.ToLower(filter.Order)]; ok {
		sortOrder = val
	}

	// Apply ordering
	query = query.Order(fmt.Sprintf("%s %s", sortField, sortOrder))

	// Count total items
	if countResult := query.Count(&count); countResult.Error != nil {
		panic(fmt.Errorf("failed to count total items: %w", countResult.Error))
	}

	// Normalize pagination input
	if filter.Offset < 0 {
		filter.Offset = 0
	}

	if filter.Limit <= 0 || filter.Limit > 100 {
		filter.Limit = 20
	}

	query = query.Offset(filter.Offset).Limit(filter.Limit)

	// Fetch filtered items
	if result := query.Find(&items); result.Error != nil {
		panic(fmt.Errorf("failed to fetch filtered items: %w", result.Error))
	}

	return items, count
}

func (repository *IdentityRepository) GetPaginatedRoles(filter RolePaginatedFilter) (items []models.Role, count int64) {
	query := repository.defaultDB.Model(&models.Role{})

	// Apply search filter
	if filter.Search != "" {
		query = query.Where("LOWER(name) LIKE LOWER(?)", "%"+filter.Search+"%")
	}

	allowedSortFields := map[string]string{
		"name":      "name",
		"createdAt": "created_at",
		"updatedAt": "updated_at",
		"order":     "\"order\"", // quoted to avoid reserved keyword issues
	}

	allowedOrders := map[string]string{
		"asc":  "ASC",
		"desc": "DESC",
	}

	// Default sort settings
	sortField := "\"order\""
	sortOrder := "ASC"

	// Use camelCase filter.Sort and map to actual DB column
	if dbField, ok := allowedSortFields[filter.Sort]; ok {
		sortField = dbField
	}

	if val, ok := allowedOrders[strings.ToLower(filter.Order)]; ok {
		sortOrder = val
	}

	// Apply ordering
	query = query.Order(fmt.Sprintf("%s %s", sortField, sortOrder))

	// Count total items
	if countResult := query.Count(&count); countResult.Error != nil {
		panic(fmt.Errorf("failed to count total items: %w", countResult.Error))
	}

	// Normalize pagination input
	if filter.Offset < 0 {
		filter.Offset = 0
	}

	if filter.Limit <= 0 || filter.Limit > 100 {
		filter.Limit = 20
	}

	query = query.Offset(filter.Offset).Limit(filter.Limit)

	// Fetch filtered items
	if result := query.Find(&items); result.Error != nil {
		panic(fmt.Errorf("failed to fetch filtered items: %w", result.Error))
	}

	return items, count
}

func (repository *IdentityRepository) GetRoles(filter RoleFilter) []models.Role {
	var items []models.Role
	query := repository.defaultDB.Model(&models.Role{})

	// Apply search filter
	if filter.Search != "" {
		query = query.Where("LOWER(name) LIKE LOWER(?)", "%"+filter.Search+"%")
	}

	allowedSortFields := map[string]string{
		"name":      "name",
		"createdAt": "created_at",
		"updatedAt": "updated_at",
		"order":     "\"order\"",
	}

	allowedOrders := map[string]string{
		"asc":  "ASC",
		"desc": "DESC",
	}

	// Default sort settings
	sortField := "\"order\""
	sortOrder := "ASC"

	// Map camelCase input to actual DB column
	if dbField, ok := allowedSortFields[filter.Sort]; ok {
		sortField = dbField
	}

	if val, ok := allowedOrders[strings.ToLower(filter.Order)]; ok {
		sortOrder = val
	}

	// Apply ordering
	query = query.Order(fmt.Sprintf("%s %s", sortField, sortOrder))

	// Fetch filtered items
	if result := query.Find(&items); result.Error != nil {
		panic(fmt.Errorf("failed to fetch filtered items: %w", result.Error))
	}

	return items
}

func (repository *IdentityRepository) GetRoleById(id string) *models.Role {
	role := &models.Role{}
	result := repository.defaultDB.Model(&models.Role{}).
		Where("id = ?", id).
		First(role)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil
		}

		panic(fmt.Errorf("failed to find category by id: %w", result.Error))
	}

	return role
}
