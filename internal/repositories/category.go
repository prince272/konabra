package repositories

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/prince272/konabra/internal/builds"
	"github.com/prince272/konabra/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CategoryRepository struct {
	defaultDB *builds.DefaultDB
	logger    *zap.Logger
}

type CategoryFilter struct {
	Sort   string `json:"sort" form:"sort"`
	Order  string `json:"order" form:"order"` // "asc" or "desc"
	Search string `json:"search" form:"search"`
}

type CategoryPaginatedFilter struct {
	CategoryFilter
	Offset int `json:"offset" form:"offset"`
	Limit  int `json:"limit" form:"limit"`
}

func NewCategoryRepository(defaultDB *builds.DefaultDB, logger *zap.Logger) *CategoryRepository {
	return &CategoryRepository{defaultDB, logger}
}

func (repository *CategoryRepository) CreateCategory(category *models.Category) error {
	category.CreatedAt = time.Now()
	category.UpdatedAt = time.Now()
	result := repository.defaultDB.Create(category)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *CategoryRepository) UpdateCategory(category *models.Category) error {
	category.UpdatedAt = time.Now()
	result := repository.defaultDB.Save(category)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *CategoryRepository) DeleteCategory(category *models.Category) error {
	result := repository.defaultDB.Delete(category)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (repository *CategoryRepository) CategoryNameExists(name string) bool {
	var count int64
	result := repository.defaultDB.Model(&models.Category{}).
		Where("LOWER(name) = LOWER(?)", name).
		Count(&count)

	if result.Error != nil {
		panic(fmt.Errorf("failed to check if category name exists: %w", result.Error))
	}

	return count > 0
}

func (repository *CategoryRepository) CategorySlugExists(name string) bool {
	var count int64
	result := repository.defaultDB.Model(&models.Category{}).
		Where("LOWER(short_name) = LOWER(?)", name).
		Count(&count)

	if result.Error != nil {
		panic(fmt.Errorf("failed to check if category name exists: %w", result.Error))
	}

	return count > 0
}

func (repository *CategoryRepository) GetCategoryById(id string) *models.Category {
	category := &models.Category{}
	result := repository.defaultDB.Model(&models.Category{}).
		Where("id = ?", id).
		First(category)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil
		}

		panic(fmt.Errorf("failed to find category by id: %w", result.Error))
	}

	return category
}

func (repository *CategoryRepository) GetPaginatedCategories(filter CategoryPaginatedFilter) (items []models.Category, count int64) {
	query := repository.defaultDB.Model(&models.Category{})

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
	sortField := "\"created_at\""
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
