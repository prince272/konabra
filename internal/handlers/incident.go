package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/constants"
	"github.com/prince272/konabra/internal/helpers"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/internal/services"
	"github.com/prince272/konabra/pkg/period"
)

// IncidentHandler handles incident routes
type IncidentHandler struct {
	incidentService *services.IncidentService
	jwtHelper       *helpers.JwtHelper
}

// NewIncidentHandler registers incident routes
func NewIncidentHandler(router *gin.Engine, incidentService *services.IncidentService, jwtHelper *helpers.JwtHelper) *IncidentHandler {
	handler := &IncidentHandler{incidentService, jwtHelper}

	incidentGroup := router.Group("/incidents", jwtHelper.RequireAuth())
	{
		incidentGroup.GET("", handler.handleWithData(handler.GetPaginatedIncidents))
		incidentGroup.GET("/:id", handler.handleWithData(handler.GetIncidentById))
		incidentGroup.POST("", handler.handleWithData(handler.CreateIncident))
		incidentGroup.PUT("/:id", handler.handleWithData(handler.UpdateIncident))
		incidentGroup.DELETE("/:id", handler.handle(handler.DeleteIncident))
		incidentGroup.GET("/statistics", handler.handleWithData(handler.GetIncidentStatistics))
		incidentGroup.GET("/insights", handler.handleWithData(handler.GetIncidentInsights))
	}

	return handler
}

func (handler *IncidentHandler) handleWithData(handlerFunc func(*gin.Context) (any, *problems.Problem)) gin.HandlerFunc {
	return func(context *gin.Context) {
		response, problem := handlerFunc(context)
		if problem != nil {
			context.JSON(problem.Status, problem)
			return
		}
		context.JSON(http.StatusOK, response)
	}
}

func (handler *IncidentHandler) handle(handlerFunc func(*gin.Context) *problems.Problem) gin.HandlerFunc {
	return func(context *gin.Context) {
		problem := handlerFunc(context)
		if problem != nil {
			context.JSON(problem.Status, problem)
			return
		}
		context.JSON(http.StatusOK, nil)
	}
}

// CreateIncident creates a new incident
// @Summary Create a new incident
// @Tags Incidents
// @Accept json
// @Produce json
// @Param body body services.CreateIncidentForm true "Incident creation form"
// @Security BearerAuth
// @Router /incidents [post]
func (handler *IncidentHandler) CreateIncident(context *gin.Context) (any, *problems.Problem) {
	var form services.CreateIncidentForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}

	claims := context.MustGet(constants.ContextClaimsKey).(map[string]any)
	userId := claims["sub"].(string)

	return handler.incidentService.CreateIncident(userId, form)
}

// UpdateIncident updates an existing incident
// @Summary Update an existing incident
// @Tags Incidents
// @Accept json
// @Produce json
// @Param id path string true "Incident Id"
// @Param body body services.UpdateIncidentForm true "Incident update form"
// @Security BearerAuth
// @Router /incidents/{id} [put]
func (handler *IncidentHandler) UpdateIncident(context *gin.Context) (any, *problems.Problem) {
	id := context.Param("id")
	if id == "" {
		return nil, problems.NewProblem(http.StatusNotFound, "Incident not found.")
	}

	var form services.UpdateIncidentForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}

	return handler.incidentService.UpdateIncident(id, form)
}

// DeleteIncident deletes an incident by Id
// @Summary Delete an incident by Id
// @Tags Incidents
// @Accept json
// @Produce json
// @Param id path string true "Incident Id"
// @Security BearerAuth
// @Router /incidents/{id} [delete]
func (handler *IncidentHandler) DeleteIncident(context *gin.Context) *problems.Problem {
	id := context.Param("id")
	if id == "" {
		return problems.NewProblem(http.StatusNotFound, "Incident not found.")
	}

	return handler.incidentService.DeleteIncident(id)
}

// GetPaginatedIncidents retrieves paginated incidents based on filters
// @Summary Get paginated incidents
// @Tags Incidents
// @Accept json
// @Produce json
// @Param filter query repositories.IncidentPaginatedFilter false "Incident filter"
// @Security BearerAuth
// @Router /incidents [get]
func (handler *IncidentHandler) GetPaginatedIncidents(context *gin.Context) (any, *problems.Problem) {
	var filter repositories.IncidentPaginatedFilter
	if err := context.ShouldBindQuery(&filter); err != nil {
		return nil, problems.FromError(err)
	}

	return handler.incidentService.GetPaginatedIncidents(filter)
}

// GetIncidentById retrieves a single incident by Id
// @Summary Get incident by Id
// @Tags Incidents
// @Accept json
// @Produce json
// @Param id path string true "Incident Id"
// @Security BearerAuth
// @Router /incidents/{id} [get]
func (handler *IncidentHandler) GetIncidentById(context *gin.Context) (any, *problems.Problem) {
	id := context.Param("id")
	if id == "" {
		return nil, problems.NewProblem(http.StatusNotFound, "Incident not found.")
	}

	return handler.incidentService.GetIncidentById(id)
}

// GetIncidentStatistics retrieves statistics for incidents
// @Summary Get incidents statistics
// @Tags Incidents
// @Accept json
// @Produce json
// @Param dateRange query period.DateRange false "Date range for statistics"
// @Security BearerAuth
// @Router /incidents/statistics [get]
func (handler *IncidentHandler) GetIncidentStatistics(context *gin.Context) (any, *problems.Problem) {
	var dateRange period.DateRange
	if err := context.ShouldBindQuery(&dateRange); err != nil {
		return nil, problems.FromError(err)
	}

	return handler.incidentService.GetIncidentStatistics(dateRange)
}

// GetIncidentInsights retrieves insights for incidents
// @Summary Get incidents insights
// @Tags Incidents
// @Accept json
// @Produce json
// @Param dateRange query period.DateRange false "Date range for insights"
// @Security BearerAuth
// @Router /incidents/insights [get]
func (handler *IncidentHandler) GetIncidentInsights(context *gin.Context) (any, *problems.Problem) {
	var dateRange period.DateRange
	if err := context.ShouldBindQuery(&dateRange); err != nil {
		return nil, problems.FromError(err)
	}

	return handler.incidentService.GetIncidentInsights(dateRange)
}
