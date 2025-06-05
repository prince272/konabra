package models

import (
	"time"

	"gorm.io/gorm"
)

type Role struct {
	Id        string `gorm:"primaryKey"`
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index"`
	Order     int
	Users     []User `gorm:"many2many:user_roles;"`
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
