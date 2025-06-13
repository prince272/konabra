package models

import (
	"strings"
	"time"

	"gorm.io/gorm"
)

type UserStatus string

const (
	UserStatusActive  UserStatus = "active"  // Normal, fully functional account
	UserStatusLocked  UserStatus = "locked"  // Temporarily blocked (e.g. too many failed logins)
	UserStatusBlocked UserStatus = "blocked" // Blocked due to violation or abuse (temp or permanent)
)

type User struct {
	Id                    string         `gorm:"primaryKey" json:"id"`
	FirstName             string         `json:"firstName"`
	LastName              string         `json:"lastName"`
	UserName              string         `json:"userName"`
	Email                 string         `json:"email"`
	EmailVerified         bool           `json:"emailVerified"`
	PhoneNumber           string         `json:"phoneNumber"`
	PhoneNumberVerified   bool           `json:"phoneNumberVerified"`
	SecurityStamp         string         `json:"securityStamp"`
	PasswordHash          string         `json:"passwordHash"`
	HasPassword           bool           `json:"hasPassword"`
	CreatedAt             time.Time      `json:"createdAt"`
	UpdatedAt             time.Time      `json:"updatedAt"`
	LastActiveAt          time.Time      `json:"lastActiveAt"`
	LastPasswordChangedAt *time.Time     `json:"lastPasswordChangedAt"`
	UserRoles             []*Role        `gorm:"many2many:user_roles;" json:"userRoles"`
	DeletedAt             gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deletedAt"`
	Status                UserStatus     `json:"status" gorm:"default:'active'"`
	StatusReason          string         `json:"statusReason"`
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
