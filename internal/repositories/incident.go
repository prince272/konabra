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

type IncidentRepository struct {
	defaultDB *builds.DefaultDB
	logger    *zap.Logger
}

type IncidentFilter struct {
	Sort      string                  `json:"sort" form:"sort"`
	Order     string                  `json:"order" form:"order"` // asc or desc
	Search    string                  `json:"search" form:"search"`
	Severity  models.IncidentSeverity `json:"severity" form:"severity"`
	Status    models.IncidentStatus   `json:"status" form:"status"`
	StartDate string                  `json:"startDate" form:"startDate"`
	EndDate   string                  `json:"endDate" form:"endDate"`
}

type IncidentPaginatedFilter struct {
	IncidentFilter
	Offset int `json:"offset" form:"offset"`
	Limit  int `json:"limit" form:"limit"`
}

func NewIncidentRepository(defaultDB *builds.DefaultDB, logger *zap.Logger) *IncidentRepository {
	return &IncidentRepository{defaultDB, logger}
}

func (r *IncidentRepository) CreateIncident(incident *models.Incident) error {
	now := time.Now()
	incident.UpdatedAt = now
	incident.ReportedAt = now
	result := r.defaultDB.Create(incident)
	return result.Error
}

func (r *IncidentRepository) UpdateIncident(incident *models.Incident) error {
	incident.UpdatedAt = time.Now()
	return r.defaultDB.Save(incident).Error
}

func (r *IncidentRepository) DeleteIncident(incident *models.Incident) error {
	return r.defaultDB.Delete(incident).Error
}

func (r *IncidentRepository) GetIncidentById(id string) *models.Incident {
	incident := &models.Incident{}
	result := r.defaultDB.Preload("ReportedBy").Preload("Activities").
		Where("id = ?", id).
		First(incident)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil
		}
		panic(fmt.Errorf("failed to find incident by id: %w", result.Error))
	}

	return incident
}

func (r *IncidentRepository) GetPaginatedIncidents(filter IncidentPaginatedFilter) (items []*models.Incident, count int64) {
	query := r.defaultDB.Model(&models.Incident{}).
		Preload("ReportedBy")

	if filter.Search != "" {
		query = query.Where("LOWER(title) LIKE LOWER(?)", "%"+filter.Search+"%")
	}

	if filter.Severity != "" {
		query = query.Where("severity = ?", filter.Severity)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if filter.StartDate != "" {
		if start, err := time.Parse("2006-01-02", filter.StartDate); err == nil {
			query = query.Where("reported_at >= ?", start)
		}
	}

	if filter.EndDate != "" {
		if end, err := time.Parse("2006-01-02", filter.EndDate); err == nil {
			query = query.Where("reported_at <= ?", end)
		}
	}

	// CamelCase to DB column mapping
	allowedSortFields := map[string]string{
		"title":      "title",
		"reportedAt": "reported_at",
		"updatedAt":  "updated_at",
		"severity":   "severity",
	}

	allowedOrders := map[string]string{
		"asc":  "ASC",
		"desc": "DESC",
	}

	sortField := "reported_at"
	sortOrder := "DESC"

	if dbField, ok := allowedSortFields[filter.Sort]; ok {
		sortField = dbField
	}

	if val, ok := allowedOrders[strings.ToLower(filter.Order)]; ok {
		sortOrder = val
	}

	query = query.Order(fmt.Sprintf("%s %s", sortField, sortOrder))

	if countResult := query.Count(&count); countResult.Error != nil {
		panic(fmt.Errorf("failed to count incidents: %w", countResult.Error))
	}

	if filter.Offset < 0 {
		filter.Offset = 0
	}
	if filter.Limit <= 0 || filter.Limit > 100 {
		filter.Limit = 20
	}

	query = query.Offset(filter.Offset).Limit(filter.Limit)

	if result := query.Find(&items); result.Error != nil {
		panic(fmt.Errorf("failed to fetch incidents: %w", result.Error))
	}

	return items, count
}
