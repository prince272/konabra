package helpers

import (
	"time"

	"maps"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	models "github.com/prince272/konabra/internal/models/identity"
	"github.com/prince272/konabra/utils"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type JwtHelper struct {
	Options  JwtOptions
	database *gorm.DB
	logger   *zap.Logger
}

type JwtOptions struct {
	Secret   string
	Issuer   string
	Audience []string
}

type JwtTokenModel struct {
	TokenType             string    `json:"tokenType"`
	AccessToken           string    `json:"accessToken"`
	AccessTokenExpiresAt  time.Time `json:"accessTokenExpiresAt"`
	RefreshToken          string    `json:"refreshToken"`
	RefreshTokenExpiresAt time.Time `json:"refreshTokenExpiresAt"`
}

func NewJwtHelper(options JwtOptions, database *gorm.DB, logger *zap.Logger) *JwtHelper {
	return &JwtHelper{
		Options:  options,
		database: database,
	}
}

func (helper *JwtHelper) CreateToken(subject string, claims map[string]any) (*JwtTokenModel, error) {
	creationTime := time.Now()

	accessTokenExpiresAt := creationTime.Add(15 * time.Minute) // 15 minutes
	accessToken, err := helper.generateToken(creationTime, accessTokenExpiresAt, subject, claims)
	if err != nil {
		return nil, err
	}

	refreshTokenExpiresAt := creationTime.Add(30 * 24 * time.Hour) // 30 days
	refreshToken, err := helper.generateToken(creationTime, refreshTokenExpiresAt, subject, map[string]any{})
	if err != nil {
		return nil, err
	}

	tokenType := "Bearer"
	token := &models.JwtToken{
		Id:                    uuid.New().String(),
		Subject:               subject,
		IssuedAt:              creationTime,
		AccessTokenHash:       utils.HashToken(accessToken),
		AccessTokenExpiresAt:  accessTokenExpiresAt,
		RefreshTokenHash:      utils.HashToken(refreshToken),
		RefreshTokenExpiresAt: refreshTokenExpiresAt,
		TokenType:             tokenType,
	}

	result := helper.database.Create(&token)

	if result.Error != nil {
		helper.logger.Error("Failed to create jwt token", zap.Error(result.Error))
		return nil, result.Error
	}

	return &JwtTokenModel{
		TokenType:             tokenType,
		AccessToken:           accessToken,
		AccessTokenExpiresAt:  accessTokenExpiresAt,
		RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: refreshTokenExpiresAt,
	}, nil
}

// RevokeAllTokens deletes all tokens associated with the subject.
func (helper *JwtHelper) RevokeAllTokens(subject string) error {
	if result := helper.database.
		Model(&models.JwtToken{}).
		Where("subject = ?", subject).
		Delete(&models.JwtToken{}); result.Error != nil {
		helper.logger.Error("Failed to revoke all JWT tokens", zap.Error(result.Error))
		return result.Error
	}
	return nil
}

// RevokeExpiredTokens deletes tokens for the subject where either access or refresh token has expired.
func (helper *JwtHelper) RevokeExpiredTokens(subject string) error {
	currentTime := time.Now()

	// Subject and (access expired OR refresh expired)
	if result := helper.database.
		Model(&models.JwtToken{}).
		Where("subject = ? AND (access_token_expires_at < ? OR refresh_token_expires_at < ?)",
			subject, currentTime, currentTime).
		Delete(&models.JwtToken{}); result.Error != nil {

		helper.logger.Error("Failed to revoke expired JWT tokens", zap.Error(result.Error))
		return result.Error
	}
	return nil
}

// RevokeTokenByHash deletes tokens where either access or refresh token hash matches the given token's hash.
func (helper *JwtHelper) RevokeTokenByHash(subject string, token string) error {
	tokenHash := utils.HashToken(token)
	if tokenHash == "" {
		// If hashing failed or token empty, nothing to do.
		return nil
	}

	if result := helper.database.
		Model(&models.JwtToken{}).
		Where("subject = ?", subject).
		Where("access_token_hash = ? OR refresh_token_hash = ?", tokenHash, tokenHash).
		Delete(&models.JwtToken{}); result.Error != nil {

		helper.logger.Error("Failed to revoke JWT token by hash", zap.Error(result.Error))
		return result.Error
	}
	return nil
}

func (helper *JwtHelper) generateToken(creationTime, expirationTime time.Time, subject string, claims map[string]any) (string, error) {

	// Create jwt claims
	jwtClaims := jwt.MapClaims{
		"iss": helper.Options.Issuer,
		"sub": subject,
		"aud": helper.Options.Audience,
		"exp": expirationTime.Unix(),
		"iat": creationTime.Unix(),
		"nbf": creationTime.Unix(),
		"jti": uuid.New().String(),
	}

	// Merge custom claims
	maps.Copy(jwtClaims, claims)

	// Create token with merged claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)
	return token.SignedString([]byte(helper.Options.Secret))
}
