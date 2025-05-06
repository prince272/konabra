package helpers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"maps"

	"slices"

	models "github.com/prince272/konabra/internal/models/identity"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/utils"
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
		logger:   logger,
	}
}

func (helper *JwtHelper) CreateToken(subject string, claims map[string]any) (*JwtTokenModel, error) {
	creationTime := time.Now()

	accessTokenExpiresAt := creationTime.Add(15 * time.Minute)
	accessToken, err := helper.GenerateToken(creationTime, accessTokenExpiresAt, subject, claims)
	if err != nil {
		return nil, err
	}

	refreshTokenExpiresAt := creationTime.Add(30 * 24 * time.Hour)
	refreshToken, err := helper.GenerateToken(creationTime, refreshTokenExpiresAt, subject, map[string]any{})
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

func (helper *JwtHelper) RevokeAllTokens(subject string) error {
	result := helper.database.
		Model(&models.JwtToken{}).
		Where("subject = ?", subject).
		Delete(&models.JwtToken{})
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (helper *JwtHelper) RevokeExpiredTokens(subject string) error {
	currentTime := time.Now()
	result := helper.database.
		Model(&models.JwtToken{}).
		Where("subject = ? AND (access_token_expires_at < ? OR refresh_token_expires_at < ?)",
			subject, currentTime, currentTime).
		Delete(&models.JwtToken{})
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (helper *JwtHelper) RevokeToken(subject string, tokenString string) error {
	tokenHash := utils.HashToken(tokenString)
	if tokenHash == "" {
		return nil
	}

	result := helper.database.
		Model(&models.JwtToken{}).
		Where("subject = ? AND (access_token_hash = ? OR refresh_token_hash = ?)",
			subject, tokenHash, tokenHash).
		Delete(&models.JwtToken{})
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (helper *JwtHelper) VerifyToken(subject string, tokenString string) error {
	tokenHash := utils.HashToken(tokenString)
	if tokenHash == "" {
		return errors.New("invalid token hash")
	}

	currentTime := time.Now()
	var token models.JwtToken

	result := helper.database.
		Model(&models.JwtToken{}).
		Where("subject = ? AND (access_token_hash = ? OR refresh_token_hash = ?)",
			subject, tokenHash, tokenHash).
		First(&token)

	if result.Error != nil {
		return result.Error
	}

	if token.AccessTokenExpiresAt.After(currentTime) || token.RefreshTokenExpiresAt.After(currentTime) {
		return nil
	}

	return errors.New("token has expired")
}

func (helper *JwtHelper) GenerateToken(creationTime, expirationTime time.Time, subject string, claims map[string]any) (string, error) {
	jwtClaims := jwt.MapClaims{
		"iss": helper.Options.Issuer,
		"sub": subject,
		"aud": helper.Options.Audience,
		"exp": expirationTime.Unix(),
		"iat": creationTime.Unix(),
		"nbf": creationTime.Unix(),
		"jti": uuid.New().String(),
	}

	maps.Copy(jwtClaims, claims)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)
	return token.SignedString([]byte(helper.Options.Secret))
}

func (helper *JwtHelper) ValidateToken(tokenString string) (map[string]any, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(helper.Options.Secret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}))

	if err != nil {
		return nil, errors.New("invalid token")
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		return nil, errors.New("invalid token")
	}

	// Validate expiration time
	exp, err := claims.GetExpirationTime()
	if err != nil || exp == nil {
		return nil, errors.New("missing expiration claim")
	}
	if exp.Before(time.Now()) {
		return nil, errors.New("token has expired")
	}

	// Validate not before time if present
	nbf, err := claims.GetNotBefore()
	if err != nil {
		return nil, errors.New("invalid token")
	}
	if nbf != nil && nbf.After(time.Now()) {
		return nil, errors.New("token not valid yet")
	}

	// Validate issued at time if present
	iat, err := claims.GetIssuedAt()
	if err != nil {
		return nil, errors.New("invalid token")
	}
	if iat != nil && iat.After(time.Now()) {
		return nil, errors.New("token issued in the future")
	}

	// Validate issuer
	if helper.Options.Issuer != "" {
		iss, err := claims.GetIssuer()
		if err != nil || iss != helper.Options.Issuer {
			return nil, errors.New("invalid issuer")
		}
	}

	// Validate subject
	sub, err := claims.GetSubject()

	if err != nil {
		return nil, errors.New("invalid subject")
	}

	// Validate audience
	if len(helper.Options.Audience) > 0 {
		aud, err := claims.GetAudience()
		if err != nil {
			return nil, errors.New("invalid audience")
		}

		found := false
		for _, expectedAud := range helper.Options.Audience {
			if slices.Contains(aud, expectedAud) {
				found = true
			}
			if found {
				break
			}
		}

		if !found {
			return nil, errors.New("invalid audience")
		}
	}

	// verify token
	if err := helper.VerifyToken(sub, tokenString); err != nil {
		return nil, err
	}

	return claims, nil
}

func (helper *JwtHelper) RequireAuth(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := helper.extractBearerToken(c)
		if err != nil {
			helper.logger.Error("Failed to extract token: ", zap.Error(err))
			problem := problems.NewProblem(http.StatusUnauthorized, "You are not authorized to perform this action.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, problem)
			return
		}

		claims, err := helper.ValidateToken(token)
		if err != nil {
			helper.logger.Error("Failed to validate token: ", zap.Error(err))
			problem := problems.NewProblem(http.StatusUnauthorized, "You are not authorized to perform this action.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, problem)
			return
		}

		if len(roles) > 0 && !helper.hasRequiredRole(claims, roles) {
			helper.logger.Error("Failed to validate token: ", zap.String("roles", fmt.Sprintf("%v", roles)))
			problem := problems.NewProblem(http.StatusForbidden, "You don't have the necessary permissions.")
			c.AbortWithStatusJSON(http.StatusForbidden, problem)
			return
		}

		subject, ok := claims["sub"].(string)
		if !ok {
			helper.logger.Error("Failed to extract subject from claims")
			problem := problems.NewProblem(http.StatusUnauthorized, "You are not authorized to perform this action.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, problem)
			return
		}
		c.Set("sub", subject)
	}
}

func (helper *JwtHelper) extractBearerToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	const prefix = "Bearer "

	if authHeader == "" {
		return "", errors.New("missing Authorization header")
	}

	if len(authHeader) <= len(prefix) || authHeader[:len(prefix)] != prefix {
		return "", errors.New("malformed Authorization header")
	}

	return authHeader[len(prefix):], nil
}

func (helper *JwtHelper) hasRequiredRole(claims map[string]any, requiredRoles []string) bool {
	userRoles := helper.extractRolesFromClaims(claims)
	if len(userRoles) == 0 {
		return false
	}

	for _, requiredRole := range requiredRoles {
		if slices.Contains(userRoles, requiredRole) {
			return true
		}
	}

	return false
}

func (helper *JwtHelper) extractRolesFromClaims(claims map[string]any) []string {
	var roles []string

	switch v := claims["roles"].(type) {
	case string:
		roles = append(roles, v)
	case []any:
		for _, role := range v {
			if str, ok := role.(string); ok {
				roles = append(roles, str)
			}
		}
	}

	return roles
}
