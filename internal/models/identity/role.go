package models

import "gorm.io/gorm"

type Role struct {
	gorm.Model
	Id    string
	Name  string
	Users []*User `gorm:"many2many:user_roles;"`
}
