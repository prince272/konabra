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

type IncidentSeverityInsights struct {
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

type IncidentSeverityInsightsFilter struct {
	period.DateRange
	categoryId string
}

type IncidentCategoryCount struct {
	Id    string `json:"id"`
	Count int64  `json:"count"`
	Name  string `json:"name"`
	Slug  string `json:"slug"`
}

type IncidentCategoryInsights struct {
	Counts []IncidentCategoryCount `json:"counts"`
}

type IncidentCategoryInsightsFilter struct {
	period.DateRange
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

func (repository *IncidentRepository) GetIncidentSeverityInsights(filter IncidentSeverityInsightsFilter) (*IncidentSeverityInsights, error) {
	unit := period.GetUnit(filter.StartDate, filter.EndDate)
	repository.logger.Debug("Starting GetIncidentInsights",
		zap.Time("startDate", filter.StartDate),
		zap.Time("endDate", filter.EndDate),
		zap.String("unit", fmt.Sprint(unit)),
	)

	query := repository.defaultDB.Model(&models.Incident{})

	if !filter.StartDate.IsZero() {
		query = query.Where("reported_at >= ?", filter.StartDate)
	}

	if !filter.EndDate.IsZero() {
		query = query.Where("reported_at <= ?", filter.EndDate)
	}

	if filter.categoryId != "" {
		query = query.Where("category_id = ?", filter.categoryId)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		repository.logger.Error("Failed to count incidents", zap.Error(err))
		return nil, fmt.Errorf("failed to count incidents: %w", err)
	}
	repository.logger.Debug("Incident count retrieved", zap.Int64("count", count))

	var lowSeverityTimeSeries, mediumSeverityTimeSeries, highSeverityTimeSeries []IncidentTimeSeriesItem

	configs := map[period.Unit]struct {
		trunc    string
		interval int
	}{
		period.UnitTime:  {"hour", 1},
		period.UnitDay:   {"day", 1},
		period.UnitDate:  {"day", 1},
		period.UnitMonth: {"month", 1},
		period.UnitYear:  {"year", 1},
	}

	cfg, exists := configs[unit]
	if !exists {
		repository.logger.Error("Unsupported time unit", zap.String("unit", fmt.Sprint(unit)))
		return nil, fmt.Errorf("unsupported time unit: %d", unit)
	}

	var sqlSelect string
	switch cfg.trunc {
	case "hour":
		sqlSelect = fmt.Sprintf(`
			DATE_TRUNC('hour', reported_at) - 
			((EXTRACT(HOUR FROM reported_at)::int %% %d) * INTERVAL '1 hour') AS period, COUNT(*) AS count`, cfg.interval)
	case "day":
		sqlSelect = fmt.Sprintf(`
			DATE_TRUNC('day', reported_at) - 
			((EXTRACT(DAY FROM reported_at)::int - 1) %% %d * INTERVAL '1 day') AS period, COUNT(*) AS count`, cfg.interval)
	case "month":
		sqlSelect = fmt.Sprintf(`
			DATE_TRUNC('month', reported_at) - 
			((EXTRACT(MONTH FROM reported_at)::int - 1) %% %d * INTERVAL '1 month') AS period, COUNT(*) AS count`, cfg.interval)
	case "year":
		sqlSelect = fmt.Sprintf(`
			DATE_TRUNC('year', reported_at) - 
			((EXTRACT(YEAR FROM reported_at)::int) %% %d * INTERVAL '1 year') AS period, COUNT(*) AS count`, cfg.interval)
	default:
		repository.logger.Error("Unsupported truncation unit", zap.String("trunc", cfg.trunc))
		return nil, fmt.Errorf("unsupported truncation unit: %s", cfg.trunc)
	}

	for _, severity := range []models.IncidentSeverity{
		models.IncidentSeverityLow,
		models.IncidentSeverityMedium,
		models.IncidentSeverityHigh,
	} {
		var result *[]IncidentTimeSeriesItem
		switch severity {
		case models.IncidentSeverityLow:
			result = &lowSeverityTimeSeries
		case models.IncidentSeverityMedium:
			result = &mediumSeverityTimeSeries
		case models.IncidentSeverityHigh:
			result = &highSeverityTimeSeries
		}

		if err := query.Session(&gorm.Session{}).
			Where("severity = ?", severity).
			Select(sqlSelect).
			Group("period").
			Order("period").
			Scan(result).Error; err != nil {
			repository.logger.Error("Failed to query severity incidents",
				zap.String("severity", string(severity)), zap.Error(err))
			return nil, fmt.Errorf("failed to query %s incidents: %w", severity, err)
		}
	}

	datePeriods := period.GetPeriods(filter.StartDate, filter.EndDate, unit)
	repository.logger.Debug("Date periods computed", zap.Int("periodsCount", len(datePeriods)))

	normalizeIncidents := func(incidents []IncidentTimeSeriesItem) []IncidentTimeSeriesItem {
		countByPeriod := make(map[time.Time]int64, len(incidents))
		for _, incident := range incidents {
			countByPeriod[incident.Period.UTC().Round(0)] = incident.Count
		}

		normalized := make([]IncidentTimeSeriesItem, 0, len(datePeriods))
		for _, datePeriod := range datePeriods {
			normalized = append(normalized, IncidentTimeSeriesItem{
				Period: datePeriod,
				Count:  countByPeriod[datePeriod.UTC().Round(0)],
				Label:  period.GetFormattedUnit(datePeriod, unit),
			})
		}
		return normalized
	}

	transformIncidents := func(groups ...[]IncidentTimeSeriesItem) []IncidentSeveritySeriesItem {
		length := len(groups[0])
		transformed := make([]IncidentSeveritySeriesItem, length)
		for i := 0; i < length; i++ {
			transformed[i] = IncidentSeveritySeriesItem{
				Label:  groups[0][i].Label,
				Period: groups[0][i].Period,
				Low:    groups[0][i].Count,
				Medium: groups[1][i].Count,
				High:   groups[2][i].Count,
			}
		}
		return transformed
	}

	series := transformIncidents(
		normalizeIncidents(lowSeverityTimeSeries),
		normalizeIncidents(mediumSeverityTimeSeries),
		normalizeIncidents(highSeverityTimeSeries),
	)

	repository.logger.Debug("Returning insights result",
		zap.Int("seriesLength", len(series)),
		zap.Int64("totalCount", count),
	)

	return &IncidentSeverityInsights{
		Series: series,
		Count:  count,
	}, nil
}

func (repository *IncidentRepository) GetIncidentCategoryInsights(filter IncidentCategoryInsightsFilter) (*IncidentCategoryInsights, error) {
	unit := period.GetUnit(filter.StartDate, filter.EndDate)
	repository.logger.Debug("Starting GetIncidentCategoryInsights",
		zap.Time("startDate", filter.StartDate),
		zap.Time("endDate", filter.EndDate),
		zap.String("unit", fmt.Sprint(unit)),
	)

	query := repository.defaultDB.Model(&models.Incident{})

	if !filter.StartDate.IsZero() {
		query = query.Where("reported_at >= ?", filter.StartDate)
	}

	if !filter.EndDate.IsZero() {
		query = query.Where("reported_at <= ?", filter.EndDate)
	}

	var counts []IncidentCategoryCount

	if err := query.Select("category_id AS id, COUNT(*) AS count, c.name, c.slug").
		Joins("JOIN categories c ON c.id = category_id").
		Group("category_id, c.name, c.slug").
		Order("count DESC").
		Scan(&counts).Error; err != nil {
		repository.logger.Error("Failed to query incident category insights", zap.Error(err))
		return nil, fmt.Errorf("failed to query incident category insights: %w", err)
	}

	if len(counts) == 0 {
		repository.logger.Debug("No incident category insights found")
		return &IncidentCategoryInsights{Counts: []IncidentCategoryCount{}}, nil
	}

	repository.logger.Debug("Incident category insights retrieved",
		zap.Int("count", len(counts)),
		zap.Any("counts", counts),
	)

	return &IncidentCategoryInsights{Counts: counts}, nil
}
