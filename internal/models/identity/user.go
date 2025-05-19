package models

import (
	"time"
)

type User struct {
	Id                   string `gorm:"primaryKey"`
	FirstName            string
	LastName             string
	UserName             string
	Email                string
	EmailVerified        bool
	PhoneNumber          string
	PhoneNumberVerified  bool
	SecurityStamp        string
	PasswordHash         string
	HasPassword          bool
	CreatedAt            time.Time
	UpdatedAt            time.Time
	LastActiveAt         time.Time
	LastPasswordChangeAt time.Time
	Roles                []*Role `gorm:"many2many:user_roles;"`
}

func (user *User) RoleNames() []string {
	roleNames := make([]string, len(user.Roles))
	for i, role := range user.Roles {
		roleNames[i] = role.Name
	}
	return roleNames
}
