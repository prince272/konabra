package period

import (
	"time"
)

// Unit represents different time granularities
type Unit int

const (
	UnitTime Unit = iota
	UnitDay
	UnitDate
	UnitMonth
	UnitYear
)

type DateRange struct {
	StartDate time.Time `json:"startDate" form:"startDate" time_format:"2006-01-02T15:04:05Z07:00"`
	EndDate   time.Time `json:"endEnd" form:"endDate" time_format:"2006-01-02T15:04:05Z07:00"`
}

func (dr *DateRange) Clone() DateRange {
	clone := DateRange{}
	clone.StartDate = dr.StartDate
	clone.EndDate = dr.EndDate
	return clone
}

// GetUnit determines the appropriate time unit for a date range
func GetUnit(start, end time.Time) Unit {
	// Normalize to UTC and start of day
	start = start.UTC().Truncate(24 * time.Hour)
	end = end.UTC().Truncate(24 * time.Hour)

	// Same day check
	if start.Equal(end) ||
		(end.Sub(start) < 24*time.Hour &&
			start.Day() == end.Day() &&
			start.Month() == end.Month() &&
			start.Year() == end.Year()) {
		return UnitTime
	}

	// Same week check
	startYear, startWeek := start.ISOWeek()
	endYear, endWeek := end.ISOWeek()
	if end.Sub(start) < 7*24*time.Hour &&
		startYear == endYear &&
		startWeek == endWeek {
		return UnitDay
	}

	// Same month check
	daysInMonth := time.Date(start.Year(), start.Month()+1, 0, 0, 0, 0, 0, time.UTC).Day()
	if start.Year() == end.Year() &&
		start.Month() == end.Month() &&
		end.Sub(start) < time.Duration(daysInMonth)*24*time.Hour {
		return UnitDate
	}

	// Same year check
	daysInYear := 365
	if isLeap(start.Year()) {
		daysInYear = 366
	}
	if start.Year() == end.Year() &&
		end.Sub(start) < time.Duration(daysInYear)*24*time.Hour {
		return UnitMonth
	}

	return UnitYear
}

// GetRanges generates time points based on the specified unit
func GetRanges(start, end time.Time, unit Unit) []time.Time {
	var ranges []time.Time
	start = start.UTC()
	end = end.UTC()

	switch unit {
	case UnitTime:
		for t := start; !t.After(end); t = t.Add(time.Hour) {
			ranges = append(ranges, t)
		}
	case UnitDay, UnitDate:
		start = start.Truncate(24 * time.Hour)
		end = end.Truncate(24 * time.Hour)
		for t := start; !t.After(end); t = t.AddDate(0, 0, 1) {
			ranges = append(ranges, t)
		}
	case UnitMonth:
		start = time.Date(start.Year(), start.Month(), 1, 0, 0, 0, 0, time.UTC)
		end = time.Date(end.Year(), end.Month(), 1, 0, 0, 0, 0, time.UTC)
		for t := start; !t.After(end); t = t.AddDate(0, 1, 0) {
			ranges = append(ranges, t)
		}
	case UnitYear:
		start = time.Date(start.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
		end = time.Date(end.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
		for t := start; !t.After(end); t = t.AddDate(1, 0, 0) {
			ranges = append(ranges, t)
		}
	}

	return ranges
}

// GetFormat returns formatted string for the time unit
func GetFormat(t time.Time, unit Unit) string {
	switch unit {
	case UnitTime:
		return t.Format("3:04 PM")
	case UnitDay:
		return t.Format("Monday")
	case UnitDate:
		return t.Format("2 Jan")
	case UnitMonth:
		return t.Format("January")
	case UnitYear:
		return t.Format("2006")
	default:
		return t.Format("2006")
	}
}

// helper function to check leap year
func isLeap(year int) bool {
	return year%4 == 0 && (year%100 != 0 || year%400 == 0)
}
