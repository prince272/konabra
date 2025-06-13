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

	"slices"

	"github.com/prince272/konabra/internal/constants"
	models "github.com/prince272/konabra/internal/models"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/utils"
)

type JwtHelper struct {
	Options   JwtOptions
	defaultDb *gorm.DB
	logger    *zap.Logger
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

func NewJwtHelper(options JwtOptions, defaultDb *gorm.DB, logger *zap.Logger) *JwtHelper {
	return &JwtHelper{
		Options:   options,
		defaultDb: defaultDb,
		logger:    logger,
	}
}

func (helper *JwtHelper) CreateToken(subject string, claims map[string]any) (*JwtTokenModel, error) {
	if subject == "" {
		return nil, errors.New("subject cannot be empty")
	}
	if len(helper.Options.Secret) < 32 {
		return nil, errors.New("secret is too short")
	}

	creationTime := time.Now()

	accessTokenExpiresAt := creationTime.Add(5 * time.Second) // 15 minutes
	accessToken, err := helper.GenerateToken(subject, creationTime, accessTokenExpiresAt, "access", claims)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshTokenExpiresAt := creationTime.Add(30 * 24 * time.Hour) // 30 days
	refreshToken, err := helper.GenerateToken(subject, creationTime, refreshTokenExpiresAt, "refresh", map[string]any{})
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
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

	result := helper.defaultDb.Create(&token)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to save token: %w", result.Error)
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
	if subject == "" {
		return errors.New("subject cannot be empty")
	}

	result := helper.defaultDb.
		Model(&models.JwtToken{}).
		Where("subject = ?", subject).
		Delete(&models.JwtToken{})
	if result.Error != nil {
		return fmt.Errorf("failed to revoke all tokens: %w", result.Error)
	}
	return nil
}

func (helper *JwtHelper) RevokeExpiredTokens(subject string) error {
	if subject == "" {
		return errors.New("subject cannot be empty")
	}

	currentTime := time.Now()
	result := helper.defaultDb.
		Model(&models.JwtToken{}).
		Where("subject = ? AND (access_token_expires_at < ? OR refresh_token_expires_at < ?)",
			subject, currentTime, currentTime).
		Delete(&models.JwtToken{})
	if result.Error != nil {
		return fmt.Errorf("failed to revoke expired tokens: %w", result.Error)
	}
	return nil
}

func (helper *JwtHelper) RevokeToken(subject, tokenString string) error {
	now := time.Now()

	// 1) Always delete any tokens for this subject that have expired
	if err := helper.defaultDb.
		Model(&models.JwtToken{}).
		Where("subject = ? AND (access_token_expires_at < ? OR refresh_token_expires_at < ?)",
			subject, now, now).
		Delete(&models.JwtToken{}).Error; err != nil {
		return err
	}

	// 2) If a tokenString was provided, delete that token (even if not yet expired)
	if tokenString == "" {
		return nil
	}
	tokenHash := utils.HashToken(tokenString)
	if tokenHash == "" {
		// hashing failed or input was empty—nothing more to revoke
		return nil
	}
	if err := helper.defaultDb.
		Model(&models.JwtToken{}).
		Where("subject = ? AND (access_token_hash = ? OR refresh_token_hash = ?)",
			subject, tokenHash, tokenHash).
		Delete(&models.JwtToken{}).Error; err != nil {
		return err
	}

	return nil
}

func (helper *JwtHelper) validateToken(subject string, tokenString string, tokenType string) bool {
	if subject == "" || tokenString == "" {
		return false
	}

	tokenHash := utils.HashToken(tokenString)
	if tokenHash == "" {
		return false
	}

	currentTime := time.Now()
	var token models.JwtToken

	query := helper.defaultDb.Model(&models.JwtToken{}).
		Where("subject = ?", subject)

	if tokenType == "access" {
		query = query.Where("access_token_hash = ? AND access_token_expires_at > ?", tokenHash, currentTime)
	} else {
		query = query.Where("refresh_token_hash = ? AND refresh_token_expires_at > ?", tokenHash, currentTime)
	}

	result := query.First(&token)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return false
		}
		helper.logger.Error("Failed to query token", zap.Error(result.Error))
		return false
	}

	return true
}

func (helper *JwtHelper) GenerateToken(subject string, creationTime, expirationTime time.Time, tokenType string, claims map[string]any) (string, error) {
	if subject == "" {
		return "", errors.New("subject cannot be empty")
	}
	if creationTime.IsZero() || expirationTime.IsZero() {
		return "", errors.New("invalid time parameters")
	}
	if tokenType != "access" && tokenType != "refresh" {
		return "", errors.New("invalid token type")
	}
	if len(helper.Options.Secret) < 32 {
		return "", errors.New("secret is too short")
	}

	jwtClaims := jwt.MapClaims{
		"iss":  helper.Options.Issuer,
		"sub":  subject,
		"aud":  helper.Options.Audience,
		"exp":  expirationTime.Unix(),
		"iat":  creationTime.Unix(),
		"nbf":  creationTime.Unix(),
		"jti":  uuid.New().String(),
		"type": tokenType,
	}

	// Copy only string and number values to prevent potential security issues
	for k, v := range claims {
		switch v.(type) {
		case string, int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64, float32, float64, bool:
			jwtClaims[k] = v
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)

	signedToken, err := token.SignedString([]byte(helper.Options.Secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return signedToken, nil
}

func (helper *JwtHelper) verifyToken(tokenType string, tokenString string) (map[string]any, error) {
	if tokenString == "" {
		return nil, errors.New("missing token")
	}

	if tokenType != "access" && tokenType != "refresh" {
		return nil, errors.New("invalid token type")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(helper.Options.Secret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}))

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("invalid token signature")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims format")
	}

	tokenTypeClaim, ok := claims["type"].(string)
	if !ok || tokenTypeClaim != tokenType {
		return nil, errors.New("invalid token type claim")
	}

	// Validate expiration time
	exp, err := claims.GetExpirationTime()
	if err != nil || exp == nil {
		return nil, errors.New("missing or invalid expiration claim")
	}
	if exp.Before(time.Now()) {
		return nil, errors.New("token has expired")
	}

	// Validate not before time if present
	nbf, err := claims.GetNotBefore()
	if err != nil {
		return nil, errors.New("invalid not before claim")
	}
	if nbf != nil && nbf.After(time.Now()) {
		return nil, errors.New("token not valid yet")
	}

	// Validate issued at time
	iat, err := claims.GetIssuedAt()
	if err != nil {
		return nil, errors.New("invalid issued at claim")
	}
	if iat != nil && iat.After(time.Now()) {
		return nil, errors.New("token issued in the future")
	}

	// Validate issuer
	if helper.Options.Issuer != "" {
		iss, err := claims.GetIssuer()
		if err != nil || iss != helper.Options.Issuer {
			return nil, errors.New("invalid issuer claim")
		}
	}

	// Validate subject
	sub, err := claims.GetSubject()
	if err != nil || sub == "" {
		return nil, errors.New("invalid subject claim")
	}

	// Validate audience
	if len(helper.Options.Audience) > 0 {
		aud, err := claims.GetAudience()
		if err != nil {
			return nil, errors.New("invalid audience claim")
		}

		found := false
		for _, expectedAud := range helper.Options.Audience {
			if slices.Contains(aud, expectedAud) {
				found = true
				break
			}
		}

		if !found {
			return nil, errors.New("invalid audience claim")
		}
	}

	// validate token against database
	if ok := helper.validateToken(sub, tokenString, tokenType); !ok {
		return nil, errors.New("token is revoked or expired")
	}

	return claims, nil
}

func (helper *JwtHelper) VerifyAccessToken(tokenString string) (map[string]any, error) {
	return helper.verifyToken("access", tokenString)
}

func (helper *JwtHelper) VerifyRefreshToken(tokenString string) (map[string]any, error) {
	return helper.verifyToken("refresh", tokenString)
}

func (helper *JwtHelper) RequireAuth(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := helper.extractBearerToken(c)
		if err != nil {
			helper.logger.Warn("Failed to extract token", zap.Error(err))
			problem := problems.NewProblem(http.StatusUnauthorized, "You are not authorized to perform this action.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, problem)
			return
		}

		claims, err := helper.VerifyAccessToken(token)
		if err != nil {
			helper.logger.Warn("Failed to verify token", zap.Error(err))
			problem := problems.NewProblem(http.StatusUnauthorized, "You are not authorized to perform this action.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, problem)
			return
		}

		if len(roles) > 0 && !helper.hasRequiredRole(claims, roles) {
			helper.logger.Warn("Access denied for roles", zap.Strings("requiredRoles", roles))
			problem := problems.NewProblem(http.StatusForbidden, "You don't have the necessary permissions.")
			c.AbortWithStatusJSON(http.StatusForbidden, problem)
			return
		}

		c.Set(constants.ContextClaimsKey, claims)
	}
}

func (helper *JwtHelper) extractBearerToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	const prefix = "Bearer "

	if authHeader == "" {
		return "", errors.New("authorization header is required")
	}

	if len(authHeader) <= len(prefix) || authHeader[:len(prefix)] != prefix {
		return "", errors.New("authorization header must start with 'Bearer '")
	}

	token := authHeader[len(prefix):]
	if token == "" {
		return "", errors.New("token cannot be empty")
	}

	return token, nil
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
	case []string:
		roles = append(roles, v...)
	}

	return roles
}
