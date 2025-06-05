package models

import "time"

type JwtToken struct {
	Id                    string `gorm:"primaryKey"`
	Subject               string
	TokenType             string
	IssuedAt              time.Time
	AccessTokenHash       string
	AccessTokenExpiresAt  time.Time
	RefreshTokenHash      string
	RefreshTokenExpiresAt time.Time
}
