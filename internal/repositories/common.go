package repositories

import "time"

type Trend struct {
	OldStart      time.Time `json:"oldStart"`
	OldEnd        time.Time `json:"oldEnd"`
	NewStart      time.Time `json:"newStart"`
	NewEnd        time.Time `json:"newEnd"`
	OldCount      int64     `json:"oldCount"`
	NewCount      int64     `json:"newCount"`
	PercentChange float64   `json:"percentChange"` // Percentage change from old to new count
	IsIncrease    bool      `json:"isIncrease"`    // True if new count is greater than old count
	IsDecrease    bool      `json:"isDecrease"`    // True if new count is less than old count
}

func CalculateTrend(startDate, endDate time.Time, countFunc func(time.Time, time.Time) int64) Trend {
	duration := endDate.Sub(startDate)

	oldEnd := startDate.Add(-time.Second)
	oldStart := oldEnd.Add(-duration)

	oldCount := countFunc(oldStart, oldEnd)
	newCount := countFunc(startDate, endDate)

	var percentChange float64
	if oldCount != 0 {
		percentChange = float64(newCount-oldCount) / float64(oldCount) * 100
	}

	return Trend{
		OldStart:      oldStart,
		OldEnd:        oldEnd,
		NewStart:      startDate,
		NewEnd:        endDate,
		OldCount:      oldCount,
		NewCount:      newCount,
		PercentChange: percentChange,
		IsIncrease:    percentChange > 0,
		IsDecrease:    percentChange < 0,
	}
}
