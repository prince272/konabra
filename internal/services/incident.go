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
	"go.uber.org/zap"
)

type IncidentService struct {
	incidentRepository *repositories.IncidentRepository
	validator          *helpers.Validator
	logger             *zap.Logger
}

type CreateIncidentForm struct {
	CategoryId  string                  `json:"categoryId" validate:"required"`
	Title       string                  `json:"title" validate:"required,max=256"`
	Description string                  `json:"description" validate:"max=1024"`
	Severity    models.IncidentSeverity `json:"severity" validate:"required"`
	Status      models.IncidentStatus   `json:"status" validate:"required"`
	Latitude    float64                 `json:"latitude"`
	Longitude   float64                 `json:"longitude"`
	Location    string                  `json:"location"`
}

type UpdateIncidentForm struct {
	CreateIncidentForm
}

type IncidentModel struct {
	Id           string                  `json:"id"`
	Title        string                  `json:"title"`
	Description  string                  `json:"description"`
	Severity     models.IncidentSeverity `json:"severity"`
	Status       models.IncidentStatus   `json:"status"`
	ReportedAt   time.Time               `json:"reportedAt"`
	ResolvedAt   *time.Time              `json:"resolvedAt"`
	ReportedById string                  `json:"reportedById"`
	Latitude     float64                 `json:"latitude"`
	Longitude    float64                 `json:"longitude"`
	Location     string                  `json:"location"`
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

func (service *IncidentService) CreateIncident(form CreateIncidentForm) (*IncidentModel, *problems.Problem) {
	if err := service.validator.ValidateStruct(form); err != nil {
		return nil, problems.FromError(err)
	}

	incident := &models.Incident{}
	if err := copier.Copy(incident, form); err != nil {
		service.logger.Error("Copy error", zap.Error(err))
		return nil, problems.FromError(err)
	}

	incident.Id = uuid.New().String()
	incident.ReportedAt = time.Now()
	incident.UpdatedAt = incident.ReportedAt

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
