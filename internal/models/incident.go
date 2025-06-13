package models

import (
	"time"

	"gorm.io/gorm"
)

type IncidentActivity struct {
	Id         string    `gorm:"primaryKey" json:"id"`
	IncidentId string    `json:"incidentId"`
	Incident   *Incident `json:"incident"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"createdAt"`
}

type Incident struct {
	CategoryId   string              `json:"categoryId"`
	Category     *Category           `gorm:"foreignKey:CategoryId;" json:"category"`
	Id           string              `gorm:"primaryKey" json:"id"`
	Code         string              `json:"code"`
	Summary      string              `json:"summary"`
	Severity     IncidentSeverity    `json:"severity"`
	Status       IncidentStatus      `json:"status"`
	UpdatedAt    time.Time           `json:"updatedAt"`
	ReportedAt   time.Time           `json:"reportedAt"`
	ReportedBy   *User               `json:"reportedBy"`
	ReportedById string              `json:"reportedById"`
	ResolvedAt   *time.Time          `json:"resolvedAt"`
	DeletedAt    gorm.DeletedAt      `gorm:"column:deleted_at;index" json:"deletedAt"`
	Latitude     float64             `json:"latitude"`
	Longitude    float64             `json:"longitude"`
	Location     string              `json:"location"`
	Activities   []*IncidentActivity `gorm:"foreignKey:IncidentId;" json:"activities"`
}

type IncidentStatus string

const (
	IncidentStatusPending       IncidentStatus = "pending"
	IncidentStatusInvestigating IncidentStatus = "investigating"
	IncidentStatusResolved      IncidentStatus = "resolved"
	IncidentStatusFalseAlarm    IncidentStatus = "falseAlarm"
)

type IncidentSeverity string

const (
	IncidentSeverityLow    IncidentSeverity = "low"
	IncidentSeverityMedium IncidentSeverity = "medium"
	IncidentSeverityHigh   IncidentSeverity = "high"
)
