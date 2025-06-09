package models

import (
	"time"

	"gorm.io/gorm"
)

type IncidentActivity struct {
	Id         string `gorm:"primaryKey"`
	IncidentId string
	Incident   *Incident
	Message    string
	CreatedAt  time.Time
}

type Incident struct {
	CategoryId   string
	Category     *Category `gorm:"foreignKey:CategoryId;"`
	Id           string    `gorm:"primaryKey"`
	Summary      string
	Severity     IncidentSeverity
	Status       IncidentStatus
	UpdatedAt    time.Time
	ReportedAt   time.Time
	ReportedBy   *User
	ReportedById string
	ResolvedAt   *time.Time
	DeletedAt    gorm.DeletedAt `gorm:"column:deleted_at;index"`
	Latitude     float64
	Longitude    float64
	Location     string
	Activities   []*IncidentActivity `gorm:"foreignKey:IncidentId;"`
}

type IncidentStatus string

const (
	StatusPending       IncidentStatus = "pending"
	StatusInvestigating IncidentStatus = "investigating"
	StatusResolved      IncidentStatus = "resolved"
	StatusFalseAlarm    IncidentStatus = "falseAlarm"
)

type IncidentSeverity string

const (
	SeverityLow      IncidentSeverity = "low"
	SeverityMedium   IncidentSeverity = "medium"
	SeverityHigh     IncidentSeverity = "high"
	SeverityCritical IncidentSeverity = "critical"
)
