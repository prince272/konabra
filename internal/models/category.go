package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	Id          string         `gorm:"primaryKey" json:"id"`
	Name        string         `json:"name"`
	Slug        string         `json:"slug"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deletedAt"`
	Order       int64          `json:"order"`
}
