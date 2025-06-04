package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/helpers"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/internal/services"
)

// IdentityHandler handles user identity routes
type CategoryHandler struct {
	categoryService *services.CategoryService
	jwtHelper       *helpers.JwtHelper
}

// NewCategoryHandler registers category routes
func NewCategoryHandler(router *gin.Engine, categoryService *services.CategoryService, jwtHelper *helpers.JwtHelper) *CategoryHandler {
	handler := &CategoryHandler{categoryService, jwtHelper}

	categoryGroup := router.Group("/categories", jwtHelper.RequireAuth())
	{
		categoryGroup.GET("", handler.handleWithData(handler.GetPaginatedCategories))
		categoryGroup.GET("/all", handler.handleWithData(handler.GetCategories))
		categoryGroup.GET("/:id", handler.handleWithData(handler.GetCategoryById))
		categoryGroup.POST("", handler.handleWithData(handler.CreateCategory))
		categoryGroup.PUT("/:id", handler.handleWithData(handler.UpdateCategory))
		categoryGroup.DELETE("/:id", handler.handle(handler.DeleteCategory))
	}

	return handler
}

func (handler *CategoryHandler) handleWithData(handlerFunc func(*gin.Context) (any, *problems.Problem)) gin.HandlerFunc {
	return func(context *gin.Context) {
		response, problem := handlerFunc(context)
		if problem != nil {
			context.JSON(problem.Status, problem)
			return
		}
		context.JSON(http.StatusOK, response)
	}
}

func (handler *CategoryHandler) handle(handlerFunc func(*gin.Context) *problems.Problem) gin.HandlerFunc {
	return func(context *gin.Context) {
		problem := handlerFunc(context)
		if problem != nil {
			context.JSON(problem.Status, problem)
			return
		}
		context.JSON(http.StatusOK, nil)
	}
}

// CreateCategory creates a new category
// @Summary Create a new category
// @Tags Categories
// @Accept json
// @Produce json
// @Param body body services.CreateCategoryForm true "Category creation form"
// @Security BearerAuth
// @Router /categories [post]
func (handler *CategoryHandler) CreateCategory(context *gin.Context) (any, *problems.Problem) {
	var form services.CreateCategoryForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}

	return handler.categoryService.CreateCategory(form)
}

// UpdateCategory updates an existing category
// @Summary Update an existing category
// @Tags Categories
// @Accept json
// @Produce json
// @Param id path string true "Category Id"
// @Param body body services.UpdateCategoryForm true "Category update form"
// @Security BearerAuth
// @Router /categories/{id} [put]
func (handler *CategoryHandler) UpdateCategory(context *gin.Context) (any, *problems.Problem) {
	id := context.Param("id")
	if id == "" {
		return nil, problems.NewProblem(http.StatusNotFound, "Category not found.")
	}

	var form services.UpdateCategoryForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}

	return handler.categoryService.UpdateCategory(id, form)
}

// DeleteCategory deletes a category by Id
// @Summary Delete a category by Id
// @Tags Categories
// @Accept json
// @Produce json
// @Param id path string true "Category Id"
// @Security BearerAuth
// @Router /categories/{id} [delete]
func (handler *CategoryHandler) DeleteCategory(context *gin.Context) *problems.Problem {
	id := context.Param("id")
	if id == "" {
		return problems.NewProblem(http.StatusNotFound, "Category not found.")
	}

	return handler.categoryService.DeleteCategory(id)
}

// GetPaginatedCategories retrieves paginated categories based on filters
// @Summary Get paginated categories
// @Tags Categories
// @Accept json
// @Produce json
// @Param filter query repositories.CategoryPaginatedFilter false "Category filter"
// @Security BearerAuth
// @Router /categories [get]
func (handler *CategoryHandler) GetPaginatedCategories(context *gin.Context) (any, *problems.Problem) {
	var filter repositories.CategoryPaginatedFilter
	if err := context.ShouldBindQuery(&filter); err != nil {
		return nil, problems.FromError(err)
	}

	return handler.categoryService.GetPaginatedCategories(filter)
}

// GetCategories retrieves all categories
// @Summary Get all categories
// @Tags Categories
// @Accept json
// @Produce json
// @Param filter query repositories.CategoryFilter false "Category filter"
// @Security BearerAuth
// @Router /categories/all [get]
func (handler *CategoryHandler) GetCategories(context *gin.Context) (any, *problems.Problem) {
	var filter repositories.CategoryFilter
	if err := context.ShouldBindQuery(&filter); err != nil {
		return nil, problems.FromError(err)
	}

	return handler.categoryService.GetCategories(filter)
}

// GetCategory retrieves a single category by Id
// @Summary Get category by Id
// @Tags Categories
// @Accept json
// @Produce json
// @Param id path string true "Category Id"
// @Security BearerAuth
// @Router /categories/{id} [get]
func (handler *CategoryHandler) GetCategoryById(context *gin.Context) (any, *problems.Problem) {
	id := context.Param("id")
	if id == "" {
		return nil, problems.NewProblem(http.StatusNotFound, "Category not found.")
	}

	return handler.categoryService.GetCategoryById(id)
}
