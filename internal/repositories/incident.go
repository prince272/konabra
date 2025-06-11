package repositories

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jinzhu/copier"
	"github.com/prince272/konabra/internal/builds"
	"github.com/prince272/konabra/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type IncidentRepository struct {
	defaultDB *builds.DefaultDB
	logger    *zap.Logger
}

type IncidentSort struct {
	Sort  string `json:"sort" form:"sort"`
	Order string `json:"order" form:"order"` // asc or desc
}

type IncidentFilter struct {
	Search    string                  `json:"search" form:"search"`
	Severity  models.IncidentSeverity `json:"severity" form:"severity"`
	Status    models.IncidentStatus   `json:"status" form:"status"`
	StartDate time.Time               `json:"startDate" form:"startDate" time_format:"2006-01-02T15:04:05Z07:00"`
	EndDate   time.Time               `json:"endDate" form:"endDate" time_format:"2006-01-02T15:04:05Z07:00"`
}

func (source *IncidentFilter) Clone() IncidentFilter {
	clone := IncidentFilter{}
	if err := copier.Copy(&clone, source); err != nil {
		panic(fmt.Errorf("failed to clone IncidentFilter: %w", err))
	}
	return clone
}

type IncidentPaginatedFilter struct {
	IncidentFilter
	IncidentSort
	Offset int `json:"offset" form:"offset"`
	Limit  int `json:"limit" form:"limit"`
}

type IncidentStatistics struct {
	TotalIncidents      Trend `json:"totalIncidents"`
	ResolvedIncidents   Trend `json:"resolvedIncidents"`
	UnresolvedIncidents Trend `json:"unresolvedIncidents"`
}

func NewIncidentRepository(defaultDB *builds.DefaultDB, logger *zap.Logger) *IncidentRepository {
	return &IncidentRepository{defaultDB, logger}
}

func (repository *IncidentRepository) CreateIncident(incident *models.Incident) error {
	now := time.Now()
	incident.UpdatedAt = now
	incident.ReportedAt = now
	result := repository.defaultDB.Create(incident)
	return result.Error
}

func (repository *IncidentRepository) UpdateIncident(incident *models.Incident) error {
	incident.UpdatedAt = time.Now()
	return repository.defaultDB.Save(incident).Error
}

func (repository *IncidentRepository) DeleteIncident(incident *models.Incident) error {
	return repository.defaultDB.Delete(incident).Error
}

func (repository *IncidentRepository) GetIncidentById(id string) *models.Incident {
	incident := &models.Incident{}
	result := repository.defaultDB.Preload("ReportedBy").Preload("Activities").
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

func (repository *IncidentRepository) GetPaginatedIncidents(filter IncidentPaginatedFilter) (items []models.Incident, count int64) {
	query := repository.defaultDB.Model(&models.Incident{}).
		Preload("ReportedBy").
		Preload("Category")

	if filter.Search != "" {
		query = query.Where("LOWER(summary) LIKE LOWER(?)", "%"+filter.Search+"%")
	}

	if filter.Severity != "" {
		query = query.Where("severity = ?", filter.Severity)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if !filter.StartDate.IsZero() {
		query = query.Where("reported_at >= ?", filter.StartDate)
	}

	if !filter.EndDate.IsZero() {
		query = query.Where("reported_at <= ?", filter.EndDate)
	}

	allowedSortFields := map[string]string{
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

func (repository *IncidentRepository) CountIncidents(filter IncidentFilter) (int64, error) {
	query := repository.defaultDB.Model(&models.Incident{})

	if filter.Search != "" {
		query = query.Where("LOWER(summary) LIKE LOWER(?)", "%"+filter.Search+"%")
	}

	if filter.Severity != "" {
		query = query.Where("severity = ?", filter.Severity)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if !filter.StartDate.IsZero() {
		query = query.Where("reported_at >= ?", filter.StartDate)
	}

	if !filter.EndDate.IsZero() {
		query = query.Where("reported_at <= ?", filter.EndDate)
	}

	var count int64
	if result := query.Count(&count); result.Error != nil {
		return 0, fmt.Errorf("Failed to count incidents: %w", result.Error)
	}

	return count, nil
}

func (repository *IncidentRepository) GetIncidentsStatistics(filter IncidentFilter) (*IncidentStatistics, error) {
	totalIncidents := CalculateTrend(filter.StartDate, filter.EndDate, func(startDate, endDate time.Time) int64 {
		countFilter := filter.Clone()
		countFilter.StartDate = startDate
		countFilter.EndDate = endDate
		count, err := repository.CountIncidents(countFilter)
		if err != nil {
			repository.logger.Error("Failed to count incidents", zap.Error(err))
			return 0
		}
		return count
	})

	resolvedIncidents := CalculateTrend(filter.StartDate, filter.EndDate, func(startDate, endDate time.Time) int64 {
		countFilter := filter.Clone()
		countFilter.StartDate = startDate
		countFilter.EndDate = endDate
		countFilter.Status = models.StatusResolved
		count, err := repository.CountIncidents(countFilter)
		if err != nil {
			repository.logger.Error("Failed to count resolved incidents", zap.Error(err))
			return 0
		}
		return count
	})

	unresolvedIncidents := CalculateTrend(filter.StartDate, filter.EndDate, func(startDate, endDate time.Time) int64 {
		countFilter := filter.Clone()
		countFilter.StartDate = startDate
		countFilter.EndDate = endDate
		countFilter.Status = models.StatusPending
		count, err := repository.CountIncidents(countFilter)
		if err != nil {
			repository.logger.Error("Failed to count unresolved incidents", zap.Error(err))
			return 0
		}
		return count
	})

	return &IncidentStatistics{
		TotalIncidents:      totalIncidents,
		ResolvedIncidents:   resolvedIncidents,
		UnresolvedIncidents: unresolvedIncidents,
	}, nil
}
