package models

import (
	"time"

	"gorm.io/gorm"
)

type Role struct {
	Id        string         `gorm:"primaryKey" json:"id"`
	Name      string         `json:"name"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deletedAt"`
	Order     int            `json:"order"`
	Users     []*User        `gorm:"many2many:user_roles;" json:"users"`
}

var (
	RoleAdministrator = "Administrator"
	RoleModerator     = "Moderator"
	RoleReporter      = "Reporter"
	RoleResponder     = "Responder"
)

var RoleAll = []string{
	RoleAdministrator,
	RoleModerator,
	RoleReporter,
	RoleResponder,
}
