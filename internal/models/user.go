package models

import (
	"strings"
	"time"

	"gorm.io/gorm"
)

type User struct {
	Id                    string `gorm:"primaryKey"`
	FirstName             string
	LastName              string
	UserName              string
	Email                 string
	EmailVerified         bool
	PhoneNumber           string
	PhoneNumberVerified   bool
	SecurityStamp         string
	PasswordHash          string
	HasPassword           bool
	CreatedAt             time.Time
	UpdatedAt             time.Time
	LastActiveAt          time.Time
	LastPasswordChangedAt time.Time
	UserRoles             []Role         `gorm:"many2many:user_roles;"`
	DeletedAt             gorm.DeletedAt `gorm:"column:deleted_at;index"`
}

func (user *User) FullName() string {
	return strings.Trim(user.FirstName+" "+user.LastName, " ")
}

func (user *User) Roles() []string {
	roleNames := make([]string, len(user.UserRoles))
	for i, role := range user.UserRoles {
		roleNames[i] = role.Name
	}
	return roleNames
}

func (user *User) PrimaryRole() string {
	if len(user.UserRoles) == 0 {
		return ""
	}
	return user.UserRoles[0].Name
}
