package repositories

import "time"

type Trend struct {
	OldStartDate  time.Time `json:"oldStartDate"`
	OldEndDate    time.Time `json:"oldEndDate"`
	NewStartDate  time.Time `json:"newStartDate"`
	NewEndDate    time.Time `json:"newEndDate"`
	OldCount      int64     `json:"oldCount"`
	NewCount      int64     `json:"newCount"`
	PercentChange float64   `json:"percentChange"` // Percentage change from old to new count
	IsIncrease    bool      `json:"isIncrease"`    // True if new count is greater than old count
	IsDecrease    bool      `json:"isDecrease"`    // True if new count is less than old count
}

func CalculateTrend(startDate, endDate time.Time, countFunc func(time.Time, time.Time) int64) Trend {
	duration := endDate.Sub(startDate)

	oldEndDate := startDate.Add(-time.Second)
	oldStartDate := oldEndDate.Add(-duration)

	oldCount := countFunc(oldStartDate, oldEndDate)
	newCount := countFunc(startDate, endDate)

	var percentChange float64
	if oldCount != 0 {
		percentChange = float64(newCount-oldCount) / float64(oldCount) * 100
	}

	return Trend{
		OldStartDate:  oldStartDate,
		OldEndDate:    oldEndDate,
		NewStartDate:  startDate,
		NewEndDate:    endDate,
		OldCount:      oldCount,
		NewCount:      newCount,
		PercentChange: percentChange,
		IsIncrease:    percentChange > 0,
		IsDecrease:    percentChange < 0,
	}
}
