package models

import "time"

type JwtToken struct {
	Id                    string    `gorm:"primaryKey" json:"id"`
	Subject               string    `json:"subject"`
	TokenType             string    `json:"tokenType"`
	IssuedAt              time.Time `json:"issuedAt"`
	AccessTokenHash       string    `json:"accessTokenHash"`
	AccessTokenExpiresAt  time.Time `json:"accessTokenExpiresAt"`
	RefreshTokenHash      string    `json:"refreshTokenHash"`
	RefreshTokenExpiresAt time.Time `json:"refreshTokenExpiresAt"`
}
