package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/constants"
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
		identityGroup.POST("/signin", handler.handle(handler.SignIn))
		identityGroup.POST("/signin/refresh", handler.handle(handler.SignInWithRefreshToken))
		identityGroup.POST("/signout", jwtHelper.RequireAuth(), handler.handle(handler.SignOut))
		identityGroup.GET("/current", jwtHelper.RequireAuth(), handler.handle(handler.GetCurrentAccount))
		identityGroup.POST("/verify", handler.handle(handler.VerifyAccount))
		identityGroup.POST("/verify/complete", handler.handle(handler.CompleteVerifyAccount))
		identityGroup.POST("/change", jwtHelper.RequireAuth(), handler.handle(handler.ChangeAccount))
		identityGroup.POST("/change/complete", jwtHelper.RequireAuth(), handler.handle(handler.CompleteChangeAccount))
		identityGroup.POST("/password/reset", handler.handle(handler.ResetPassword))
		identityGroup.POST("/password/reset/complete", handler.handle(handler.CompleteResetPassword))
		identityGroup.POST("/password/change", jwtHelper.RequireAuth(), handler.handle(handler.ChangePassword))
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
		return nil, problems.FromError(err)
	}
	return handler.identityService.CreateAccount(form)
}

// VerifyAccount handles account verification initiation
// @Summary Initiate account verification
// @Description Starts the verification process for the account (email or phone)
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.VerifyAccountForm true "Verification details"
// @Router /account/verify [post]
func (handler *IdentityHandler) VerifyAccount(context *gin.Context) (any, *problems.Problem) {
	var form services.VerifyAccountForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}
	if problem := handler.identityService.VerifyAccount(form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// CompleteVerifyAccount handles account verification completion
// @Summary Complete account verification
// @Description Completes the verification process using the received token
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.CompleteVerifyAccountForm true "Verification completion details"
// @Router /account/verify/complete [post]
func (handler *IdentityHandler) CompleteVerifyAccount(context *gin.Context) (any, *problems.Problem) {
	var form services.CompleteVerifyAccountForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}
	if problem := handler.identityService.CompleteVerifyAccount(form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// ChangeAccount handles account change initiation
// @Summary Initiate account change
// @Description Starts the process of changing account email or phone number
// @Tags Account
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body services.ChangeAccountForm true "Account change details"
// @Router /account/change [post]
func (handler *IdentityHandler) ChangeAccount(context *gin.Context) (any, *problems.Problem) {
	claims := context.MustGet(constants.ContextClaimsKey).(map[string]any)
	userId := claims["sub"].(string)

	var form services.ChangeAccountForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}
	if problem := handler.identityService.ChangeAccount(userId, form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// CompleteChangeAccount handles account change completion
// @Summary Complete account change
// @Description Completes the process of changing account email or phone number
// @Tags Account
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body services.CompleteChangeAccountForm true "Account change completion details"
// @Router /account/change/complete [post]
func (handler *IdentityHandler) CompleteChangeAccount(context *gin.Context) (any, *problems.Problem) {
	claims := context.MustGet(constants.ContextClaimsKey).(map[string]any)
	userId := claims["sub"].(string)

	var form services.CompleteChangeAccountForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}
	if problem := handler.identityService.CompleteChangeAccount(userId, form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// ResetPassword handles password reset initiation
// @Summary Initiate password reset
// @Description Starts the process of resetting the password for the account
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.ResetPasswordForm true "Password reset details"
// @Router /account/password/reset [post]
func (handler *IdentityHandler) ResetPassword(context *gin.Context) (any, *problems.Problem) {
	var form services.ResetPasswordForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.NewProblem(http.StatusBadRequest, "The request form is incorrect.")
	}

	if problem := handler.identityService.ResetPassword(form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// CompleteResetPassword handles password reset completion
// @Summary Complete password reset
// @Description Completes the password reset process using the received token
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.CompleteResetPasswordForm true "Password reset completion details"
// @Router /account/password/reset/complete [post]
func (handler *IdentityHandler) CompleteResetPassword(context *gin.Context) (any, *problems.Problem) {
	var form services.CompleteResetPasswordForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}
	if problem := handler.identityService.CompleteResetPassword(form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// ChangePassword handles password change
// @Summary Change the current password
// @Description Changes the password for the authenticated user
// @Tags Account
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body services.ChangePasswordForm true "Password change details"
// @Router /account/password/change [post]
func (handler *IdentityHandler) ChangePassword(context *gin.Context) (any, *problems.Problem) {
	claims := context.MustGet(constants.ContextClaimsKey).(map[string]any)
	userId := claims["sub"].(string)

	var form services.ChangePasswordForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}
	if problem := handler.identityService.ChangePassword(userId, form); problem != nil {
		return nil, problem
	}
	return gin.H{}, nil
}

// SignIn handles account sign-in
// @Summary Sign in to an existing account
// @Description Authenticates a user with email and password
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.SignInForm true "Sign-in credentials"
// @Router /account/signin [post]
func (handler *IdentityHandler) SignIn(context *gin.Context) (any, *problems.Problem) {
	var form services.SignInForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}
	return handler.identityService.SignIn(form)
}

// SignInWithRefreshToken handles sign-in using a refresh token
// @Summary Sign in using a refresh token
// @Description Authenticates a user using a refresh token to obtain new access tokens
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.SignInWithRefreshTokenForm true "Refresh token details"
// @Router /account/signin/refresh [post]
func (handler *IdentityHandler) SignInWithRefreshToken(context *gin.Context) (any, *problems.Problem) {
	var form services.SignInWithRefreshTokenForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}
	return handler.identityService.SignInWithRefreshToken(form)
}

// SignOut handles account sign-out
// @Summary Sign out of the current account
// @Description Logs out the user and invalidates the session/token
// @Tags Account
// @Accept json
// @Produce json
// @Param body body services.SignOutForm true "Sign-out request details"
// @Router /account/signout [post]
func (handler *IdentityHandler) SignOut(context *gin.Context) (any, *problems.Problem) {
	claims := context.MustGet(constants.ContextClaimsKey).(map[string]any)
	userId := claims["sub"].(string)

	var form services.SignOutForm
	if err := context.ShouldBindJSON(&form); err != nil {
		return nil, problems.FromError(err)
	}

	if problem := handler.identityService.SignOut(userId, form); problem != nil {
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
// @Router /account/current [get]
func (handler *IdentityHandler) GetCurrentAccount(context *gin.Context) (any, *problems.Problem) {
	claims := context.MustGet(constants.ContextClaimsKey).(map[string]any)
	userId := claims["sub"].(string)
	return handler.identityService.GetAccountByUserId(userId)
}
