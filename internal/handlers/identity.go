package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/helpers"
	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/internal/services"
)

// IdentityHandler handles user identity routes
type IdentityHandler struct {
	identityService *services.IdentityService
	jwtHelper       *helpers.JwtHelper
}

// NewIdentityHandler registers identity routes
func NewIdentityHandler(router *gin.Engine, jwtHelper *helpers.JwtHelper, identityService *services.IdentityService) *IdentityHandler {
	handler := &IdentityHandler{identityService: identityService, jwtHelper: jwtHelper}

	identityGroup := router.Group("/account")
	{
		identityGroup.POST("/create", handler.handle(handler.CreateAccount))
		identityGroup.POST("/signin", handler.handle(handler.SignInAccount))
		identityGroup.GET("/me", jwtHelper.RequireAuth(), handler.handle(handler.GetCurrentAccount))
		identityGroup.POST("/verify", handler.handle(handler.SendAccountVerification))
		identityGroup.POST("/verify/complete", handler.handle(handler.CompleteAccountVerification))
	}

	return handler
}

// handle wraps handler functions for consistent error handling
func (handler *IdentityHandler) handle(handlerFunc func(*gin.Context) (any, *problems.Problem)) gin.HandlerFunc {
	return func(context *gin.Context) {
		response, problem := handlerFunc(context)
		if problem != nil {
			context.JSON(problem.Status, problem)
			return
		}
		context.JSON(http.StatusOK, response)
	}
}

// CreateAccount handles account creation
// @Summary Create a new user account
// @Description Creates a new user account with the provided details
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.CreateAccountForm true "Account creation details"
// @Router /account/create [post]
func (handler *IdentityHandler) CreateAccount(context *gin.Context) (any, *problems.Problem) {
	var form services.CreateAccountForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.NewProblem(http.StatusBadRequest, "The request format is incorrect.")
	}
	return handler.identityService.CreateAccount(form)
}

// SignInAccount handles account sign-in
// @Summary Sign in to an existing account
// @Description Authenticates a user with email and password
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.SignInForm true "Sign-in credentials"
// @Router /account/signin [post]
func (handler *IdentityHandler) SignInAccount(context *gin.Context) (any, *problems.Problem) {
	var form services.SignInForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.NewProblem(http.StatusBadRequest, "The request format is incorrect.")
	}
	return handler.identityService.SignInAccount(form)
}

// SendAccountVerification handles sending verification emails/SMS
// @Summary Send account verification
// @Description Sends a verification email or SMS to the user
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.AccountVerificationForm true "Verification request details"
// @Router /account/verify [post]
func (handler *IdentityHandler) SendAccountVerification(context *gin.Context) (any, *problems.Problem) {
	var form services.AccountVerificationForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.NewProblem(http.StatusBadRequest, "The request format is incorrect.")
	}
	if problem := handler.identityService.SendAccountVerification(form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// CompleteAccountVerification handles verification completion
// @Summary Complete account verification
// @Description Completes the account verification process using a token
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.CompleteAccountVerificationForm true "Verification completion details"
// @Router /account/verify/complete [post]
func (handler *IdentityHandler) CompleteAccountVerification(context *gin.Context) (any, *problems.Problem) {
	var form services.CompleteAccountVerificationForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.NewProblem(http.StatusBadRequest, "The request format is incorrect.")
	}
	if problem := handler.identityService.CompleteAccountVerification(form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// GetCurrentAccount retrieves info for the authenticated user
// @Summary Get current user account
// @Description Retrieves details of the authenticated user
// @Tags Account
// @Accept json
// @Produce json
// @Security BearerAuth
// @Router /account/me [get]
func (handler *IdentityHandler) GetCurrentAccount(context *gin.Context) (any, *problems.Problem) {
	claims, exists := context.Get("claims")
	if !exists {
		return nil, problems.NewProblem(http.StatusUnauthorized, "You are not authorized to perform this action.")
	}
	userID, ok := claims.(map[string]any)["sub"].(string)
	if !ok {
		return nil, problems.NewProblem(http.StatusUnauthorized, "You are not authorized to perform this action.")
	}
	return handler.identityService.GetAccountByUserId(userID)
}
