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
	Roles                 []*Role        `gorm:"many2many:user_roles;"`
	DeletedAt             gorm.DeletedAt `gorm:"column:deleted_at;index"`
}

func (user *User) FullName() string {
	return strings.Trim(user.FirstName+" "+user.LastName, " ")
}

func (user *User) RoleNames() []string {
	roleNames := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roleNames[i] = role.Name
	}
	return roleNames
}
