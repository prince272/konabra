package models

import "time"

type JwtToken struct {
	Id                    string
	Subject               string
	TokenType             string
	IssuedAt              time.Time
	AccessTokenHash       string
	AccessTokenExpiresAt  time.Time
	RefreshTokenHash      string
	RefreshTokenExpiresAt time.Time
}
