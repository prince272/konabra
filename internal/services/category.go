package services

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/prince272/konabra/internal/helpers"
	"github.com/prince272/konabra/internal/models"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/internal/repositories"
	"go.uber.org/zap"
)

type CategoryService struct {
	categoryRepository *repositories.CategoryRepository
	validator          *helpers.Validator
	logger             *zap.Logger
}

type CreateCategoryForm struct {
	Name        string `json:"name" validate:"required,max=256"`
	Description string `json:"description" validate:"max=1024"`
}

type UpdateCategoryForm struct {
	CreateCategoryForm
}

type CategoryModel struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	ShortName   string `json:"shortName"`
	Description string `json:"description"`
}

type CategoryListModel []CategoryModel

type CategoryPaginatedListModel struct {
	Items []CategoryModel `json:"items"`
	Count int64           `json:"count"`
}

func NewCategoryService(categoryRepository *repositories.CategoryRepository, validator *helpers.Validator, logger *zap.Logger) *CategoryService {
	return &CategoryService{
		categoryRepository,
		validator,
		logger,
	}
}

func (service *CategoryService) CreateCategory(form CreateCategoryForm) (*CategoryModel, *problems.Problem) {
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	if exists := service.categoryRepository.CategoryNameExists(form.Name); exists {
		return nil, problems.NewValidationProblem(map[string]string{"name": "Category name already exists."})
	}

	category := &models.Category{}

	if err := copier.Copy(category, form); err != nil {
		service.logger.Error("Error copying form to category: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	category.Id = uuid.New().String()
	category.ShortName = service.categoryRepository.GenerateCategoryShortName(form.Name)
	err := service.categoryRepository.CreateCategory(category)

	if err != nil {
		return nil, problems.FromError(err)
	}

	model := &CategoryModel{}

	if err := copier.Copy(model, category); err != nil {
		service.logger.Error("Error copying category to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	return model, nil
}

func (service *CategoryService) UpdateCategory(id string, form UpdateCategoryForm) (*CategoryModel, *problems.Problem) {
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	category := service.categoryRepository.GetCategoryById(id)

	if category == nil {
		return nil, problems.NewProblem(http.StatusNotFound, "Category not found.")
	}

	if exists := service.categoryRepository.CategoryNameExists(form.Name); exists {
		if category.Name != form.Name {
			return nil, problems.NewValidationProblem(map[string]string{"name": "Category name already exists for another category."})
		}
	}

	if err := copier.Copy(category, form); err != nil {
		service.logger.Error("Error copying form to category: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	category.ShortName = service.categoryRepository.GenerateCategoryShortName(form.Name)
	err := service.categoryRepository.UpdateCategory(category)

	if err != nil {
		return nil, problems.FromError(err)
	}

	model := &CategoryModel{}

	if err := copier.Copy(model, category); err != nil {
		service.logger.Error("Error copying category to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	return model, nil
}

func (service *CategoryService) DeleteCategory(id string) *problems.Problem {
	category := service.categoryRepository.GetCategoryById(id)

	if category == nil {
		return problems.NewProblem(http.StatusNotFound, "Category not found.")
	}

	if err := service.categoryRepository.DeleteCategory(category); err != nil {
		service.logger.Error("Error deleting category: ", zap.Error(err))
		return problems.FromError(err)
	}

	return nil
}

func (service *CategoryService) GetPaginatedCategories(filter repositories.CategoryPaginatedFilter) (*CategoryPaginatedListModel, *problems.Problem) {
	items, count := service.categoryRepository.GetPaginatedCategories(filter)

	models := make([]CategoryModel, 0, len(items))
	for _, item := range items {
		model := &CategoryModel{}
		if err := copier.Copy(model, item); err != nil {
			service.logger.Error("Error copying category to model: ", zap.Error(err))
			return nil, problems.FromError(err)
		}
		models = append(models, *model)
	}

	return &CategoryPaginatedListModel{
		Items: models,
		Count: count,
	}, nil
}

func (service *CategoryService) GetCategories(filter repositories.CategoryFilter) (*CategoryListModel, *problems.Problem) {
	items := service.categoryRepository.GetCategories(filter)

	models := make([]CategoryModel, 0, len(items))
	for _, item := range items {
		model := &CategoryModel{}
		if err := copier.Copy(model, item); err != nil {
			service.logger.Error("Error copying category to model: ", zap.Error(err))
			return nil, problems.FromError(err)
		}
		models = append(models, *model)
	}

	listModel := CategoryListModel(models)
	return &listModel, nil
}

func (service *CategoryService) GetCategoryById(id string) (*CategoryModel, *problems.Problem) {
	category := service.categoryRepository.GetCategoryById(id)

	if category == nil {
		return nil, problems.NewProblem(http.StatusNotFound, "Category not found.")
	}

	model := &CategoryModel{}

	if err := copier.Copy(model, category); err != nil {
		service.logger.Error("Error copying category to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	return model, nil
}
