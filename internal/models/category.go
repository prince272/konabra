package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	Id          string `gorm:"primaryKey"`
	Name        string
	ShortName   string
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;index"`
	Order       int64
}
