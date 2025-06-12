package repositories

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/prince272/konabra/internal/builds"
	"github.com/prince272/konabra/internal/models"
	"github.com/prince272/konabra/pkg/period"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type IncidentRepository struct {
	defaultDB *builds.DefaultDB
	logger    *zap.Logger
}

type IncidentFilter struct {
	period.DateRange
	Sort     string                  `json:"sort" form:"sort"`
	Order    string                  `json:"order" form:"order"` // asc or desc
	Search   string                  `json:"search" form:"search"`
	Severity models.IncidentSeverity `json:"severity" form:"severity"`
	Status   models.IncidentStatus   `json:"status" form:"status"`
}

type IncidentPaginatedFilter struct {
	IncidentFilter
	Offset int `json:"offset" form:"offset"`
	Limit  int `json:"limit" form:"limit"`
}

type IncidentStatistics struct {
	TotalIncidents      Trend `json:"totalIncidents"`
	ResolvedIncidents   Trend `json:"resolvedIncidents"`
	UnresolvedIncidents Trend `json:"unresolvedIncidents"`
}

type IncidentInsights struct {
	Series []IncidentSeveritySeriesItem `json:"series"`
	Count  int64                        `json:"count"`
}

type IncidentTimeSeriesItem struct {
	Period time.Time `json:"period"`
	Count  int64     `json:"count"`
	Label  string    `json:"label,omitempty"`
}

type IncidentSeveritySeriesItem struct {
	Label  string    `json:"label"`
	Period time.Time `json:"period"`
	Low    int64     `json:"low"`
	Medium int64     `json:"medium"`
	High   int64     `json:"high"`
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

func (repository *IncidentRepository) GetIncidentStatistics(dateRange period.DateRange) (*IncidentStatistics, error) {

	countIncidents := func(startDate, endDate time.Time, status models.IncidentStatus) (int64, error) {
		query := repository.defaultDB.Model(&models.Incident{})

		if !startDate.IsZero() {
			query = query.Where("reported_at >= ?", startDate)
		}

		if !endDate.IsZero() {
			query = query.Where("reported_at <= ?", endDate)
		}

		if status != "" {
			query = query.Where("status = ?", status)
		}

		var count int64
		if result := query.Count(&count); result.Error != nil {
			return 0, fmt.Errorf("failed to count incidents: %w", result.Error)
		}
		return count, nil
	}

	totalIncidents := CalculateTrend(dateRange.StartDate, dateRange.EndDate, func(startDate, endDate time.Time) int64 {
		count, err := countIncidents(startDate, endDate, "")
		if err != nil {
			repository.logger.Error("Failed to count incidents", zap.Error(err))
			return 0
		}
		return count
	})

	resolvedIncidents := CalculateTrend(dateRange.StartDate, dateRange.EndDate, func(startDate, endDate time.Time) int64 {
		count, err := countIncidents(startDate, endDate, models.IncidentStatusResolved)
		if err != nil {
			repository.logger.Error("Failed to count resolved incidents", zap.Error(err))
			return 0
		}
		return count
	})

	unresolvedIncidents := CalculateTrend(dateRange.StartDate, dateRange.EndDate, func(startDate, endDate time.Time) int64 {
		count, err := countIncidents(startDate, endDate, models.IncidentStatusInvestigating)
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

func (r *IncidentRepository) GetIncidentInsights(dateRange period.DateRange) (*IncidentInsights, error) {
	unit := period.GetUnit(dateRange.StartDate, dateRange.EndDate)
	query := r.defaultDB.Model(&models.Incident{})

	if !dateRange.StartDate.IsZero() {
		query = query.Where("reported_at >= ?", dateRange.StartDate)
	}
	if !dateRange.EndDate.IsZero() {
		query = query.Where("reported_at <= ?", dateRange.EndDate)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		return nil, fmt.Errorf("failed to count incidents: %w", err)
	}

	var lowSeverityTimeSeries, mediumSeverityTimeSeries, highSeverityTimeSeries []IncidentTimeSeriesItem

	// Define query parameters for different time units with intervals
	type queryConfig struct {
		trunc     string
		interval  int
		sqlFormat string
	}

	configs := map[period.Unit]queryConfig{
		period.UnitTime:  {"hour", 1, `DATE_TRUNC('hour', reported_at) - (EXTRACT(HOUR FROM reported_at)::int % ? * 1) * INTERVAL '1 hour' AS period, COUNT(*) AS count`},
		period.UnitDay:   {"day", 1, `DATE_TRUNC('day', reported_at) - (EXTRACT(DAY FROM reported_at)::int % ? * 1 - 1) * INTERVAL '1 day' AS period, COUNT(*) AS count`},
		period.UnitDate:  {"day", 1, `DATE_TRUNC('day', reported_at) - (EXTRACT(DAY FROM reported_at)::int % ? * 1 - 1) * INTERVAL '1 day' AS period, COUNT(*) AS count`},
		period.UnitMonth: {"month", 1, `DATE_TRUNC('month', reported_at) - ((EXTRACT(MONTH FROM reported_at)::int - 1) % ? * 1) * INTERVAL '1 month' AS period, COUNT(*) AS count`},
		period.UnitYear:  {"year", 1, `DATE_TRUNC('year', reported_at) - (EXTRACT(YEAR FROM reported_at)::int % ? * 1) * INTERVAL '1 year' AS period, COUNT(*) AS count`},
	}

	cfg, exists := configs[unit]

	if !exists {
		return nil, fmt.Errorf("unsupported time unit: %d", unit)
	}

	// Query incidents by severity
	queryBySeverity := func(severity models.IncidentSeverity, result *[]IncidentTimeSeriesItem) error {
		q := query.Where("severity = ?", severity)
		return q.Select(cfg.sqlFormat, cfg.interval).
			Group("period").
			Order("period").
			Scan(result).Error
	}

	for _, severity := range []models.IncidentSeverity{models.IncidentSeverityLow, models.IncidentSeverityMedium, models.IncidentSeverityHigh} {
		var result *[]IncidentTimeSeriesItem
		switch severity {
		case models.IncidentSeverityLow:
			result = &lowSeverityTimeSeries
		case models.IncidentSeverityMedium:
			result = &mediumSeverityTimeSeries
		case models.IncidentSeverityHigh:
			result = &highSeverityTimeSeries
		}
		if err := queryBySeverity(severity, result); err != nil {
			return nil, fmt.Errorf("failed to query %s incidents: %w", severity, err)
		}
	}

	// Normalize incident counts
	datePeriods := period.GetPeriods(dateRange.StartDate, dateRange.EndDate, unit)

	normalizeIncidents := func(incidents []IncidentTimeSeriesItem) []IncidentTimeSeriesItem {
		countByPeriod := make(map[time.Time]int64, len(incidents))
		for _, incident := range incidents {
			countByPeriod[incident.Period] = incident.Count
		}

		normalized := make([]IncidentTimeSeriesItem, 0, len(datePeriods))
		for _, datePeriod := range datePeriods {
			normalized = append(normalized, IncidentTimeSeriesItem{
				Period: datePeriod,
				Count:  countByPeriod[datePeriod],
				Label:  period.GetFormat(datePeriod, unit),
			})
		}
		return normalized
	}

	transformIncidents := func(incidentsGroup ...[]IncidentTimeSeriesItem) []IncidentSeveritySeriesItem {
		var transformed []IncidentSeveritySeriesItem
		for i := range incidentsGroup[0] {
			transformed = append(transformed, IncidentSeveritySeriesItem{
				Label:  incidentsGroup[0][i].Label,
				Period: incidentsGroup[0][i].Period,
				Low:    incidentsGroup[0][i].Count,
				Medium: incidentsGroup[1][i].Count,
				High:   incidentsGroup[2][i].Count,
			})
		}

		return transformed
	}

	series := transformIncidents(normalizeIncidents(lowSeverityTimeSeries), normalizeIncidents(mediumSeverityTimeSeries), normalizeIncidents(highSeverityTimeSeries))

	return &IncidentInsights{
		Series: series,
		Count:  count,
	}, nil
}
