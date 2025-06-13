package services

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/prince272/konabra/internal/helpers"
	"github.com/prince272/konabra/internal/models"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/pkg/period"
	"github.com/prince272/konabra/utils"
	"go.uber.org/zap"
)

type IncidentService struct {
	incidentRepository *repositories.IncidentRepository
	validator          *helpers.Validator
	logger             *zap.Logger
}

type CreateIncidentForm struct {
	CategoryId string  `json:"categoryId" validate:"required"`
	Summary    string  `json:"summary" validate:"required,max=256"`
	Severity   string  `json:"severity" validate:"required" enum:"low,medium,high"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Location   string  `json:"location"`
}

type UpdateIncidentForm struct {
	CreateIncidentForm
}

type IncidentModel struct {
	Id           string                  `json:"id"`
	Code         string                  `json:"code"`
	Summary      string                  `json:"summary"`
	Severity     models.IncidentSeverity `json:"severity"`
	Status       models.IncidentStatus   `json:"status"`
	ReportedAt   time.Time               `json:"reportedAt"`
	ResolvedAt   *time.Time              `json:"resolvedAt"`
	ReportedById string                  `json:"reportedById"`
	ReportedBy   AccountModel            `json:"reportedBy"`
	Latitude     float64                 `json:"latitude"`
	Longitude    float64                 `json:"longitude"`
	Location     string                  `json:"location"`
	CategoryId   string                  `json:"categoryId"`
	Category     CategoryModel           `json:"category"`
}

type IncidentPaginatedListModel struct {
	Items []IncidentModel `json:"items"`
	Count int64           `json:"count"`
}

func NewIncidentService(incidentRepo *repositories.IncidentRepository, validator *helpers.Validator, logger *zap.Logger) *IncidentService {
	return &IncidentService{
		incidentRepository: incidentRepo,
		validator:          validator,
		logger:             logger,
	}
}

func (service *IncidentService) CreateIncident(userId string, form CreateIncidentForm) (*IncidentModel, *problems.Problem) {
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	incident := &models.Incident{}
	if err := copier.Copy(incident, form); err != nil {
		service.logger.Error("Copy error", zap.Error(err))
		return nil, problems.FromError(err)
	}

	incident.Id = uuid.New().String()
	incident.Code = utils.GenerateUniqueCode("INC", 5, utils.NumericUniqueCode, "", service.incidentRepository.IncidentCodeExists)
	incident.ReportedById = userId
	incident.ReportedAt = time.Now()
	incident.UpdatedAt = incident.ReportedAt
	incident.Status = models.IncidentStatusPending

	if err := service.incidentRepository.CreateIncident(incident); err != nil {
		service.logger.Error("Failed to create incident", zap.Error(err))
		return nil, problems.FromError(err)
	}

	model := &IncidentModel{}
	if err := copier.Copy(model, incident); err != nil {
		service.logger.Error("Copy error", zap.Error(err))
		return nil, problems.FromError(err)
	}

	return model, nil
}

func (service *IncidentService) UpdateIncident(id string, form UpdateIncidentForm) (*IncidentModel, *problems.Problem) {
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	incident := service.incidentRepository.GetIncidentById(id)
	if incident == nil {
		return nil, problems.NewProblem(http.StatusNotFound, "Incident not found")
	}

	if err := copier.Copy(incident, form); err != nil {
		service.logger.Error("Copy error", zap.Error(err))
		return nil, problems.FromError(err)
	}

	incident.UpdatedAt = time.Now()

	if err := service.incidentRepository.UpdateIncident(incident); err != nil {
		return nil, problems.FromError(err)
	}

	model := &IncidentModel{}
	if err := copier.Copy(model, incident); err != nil {
		service.logger.Error("Copy error", zap.Error(err))
		return nil, problems.FromError(err)
	}

	return model, nil
}

func (service *IncidentService) DeleteIncident(id string) *problems.Problem {
	incident := service.incidentRepository.GetIncidentById(id)
	if incident == nil {
		return problems.NewProblem(http.StatusNotFound, "Incident not found")
	}

	if err := service.incidentRepository.DeleteIncident(incident); err != nil {
		return problems.FromError(err)
	}

	return nil
}

func (service *IncidentService) GetPaginatedIncidents(filter repositories.IncidentPaginatedFilter) (*IncidentPaginatedListModel, *problems.Problem) {
	items, count := service.incidentRepository.GetPaginatedIncidents(filter)

	models := make([]IncidentModel, 0, len(items))
	for _, item := range items {
		model := &IncidentModel{}

		if err := copier.Copy(model, item); err != nil {
			service.logger.Error("Error copying incident to model: ", zap.Error(err))
			return nil, problems.FromError(err)
		}

		if err := copier.Copy(&model.ReportedBy, item.ReportedBy); err != nil {
			service.logger.Error("Error copying reported by to model: ", zap.Error(err))
			return nil, problems.FromError(err)
		}

		models = append(models, *model)
	}

	return &IncidentPaginatedListModel{
		Items: models,
		Count: count,
	}, nil
}

func (service *IncidentService) GetIncidentById(id string) (*IncidentModel, *problems.Problem) {
	incident := service.incidentRepository.GetIncidentById(id)

	if incident == nil {
		return nil, problems.NewProblem(http.StatusNotFound, "Incident not found.")
	}

	model := &IncidentModel{}

	if err := copier.Copy(model, incident); err != nil {
		service.logger.Error("Error copying incident to model: ", zap.Error(err))
		return nil, problems.FromError(err)
	}

	return model, nil
}

func (service *IncidentService) GetIncidentStatistics(dateRange period.DateRange) (*repositories.IncidentStatistics, *problems.Problem) {
	if err := service.validator.ValidateStruct(dateRange); err != nil {
		return nil, problems.FromError(err)
	}
	stats, err := service.incidentRepository.GetIncidentStatistics(dateRange)
	if err != nil {
		service.logger.Error("Failed to get incidents statistics", zap.Error(err))
		return nil, problems.FromError(err)
	}
	return stats, nil
}

func (service *IncidentService) GetIncidentSeverityInsights(filter repositories.IncidentSeverityInsightsFilter) (*repositories.IncidentSeverityInsights, *problems.Problem) {
	if err := service.validator.ValidateStruct(filter); err != nil {
		return nil, problems.FromError(err)
	}
	insights, err := service.incidentRepository.GetIncidentSeverityInsights(filter)
	if err != nil {
		service.logger.Error("Failed to get incidents insights", zap.Error(err))
		return nil, problems.FromError(err)
	}
	return insights, nil
}

func (service *IncidentService) GetIncidentCategoryInsights(filter repositories.IncidentCategoryInsightsFilter) (*repositories.IncidentCategoryInsights, *problems.Problem) {
	if err := service.validator.ValidateStruct(filter); err != nil {
		return nil, problems.FromError(err)
	}
	insights, err := service.incidentRepository.GetIncidentCategoryInsights(filter)
	if err != nil {
		service.logger.Error("Failed to get incidents insights", zap.Error(err))
		return nil, problems.FromError(err)
	}
	return insights, nil
}
