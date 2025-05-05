package models

type Role struct {
	Id    string `gorm:"primaryKey"`
	Name  string
	Users []*User `gorm:"many2many:user_roles;"`
}
