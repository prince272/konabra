package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/helpers"
	"github.com/prince272/konabra/internal/services"
	"github.com/prince272/konabra/pkg/problems"
)

type IdentityHandler struct {
	router          *gin.Engine
	identityService *services.IdentityService
}

func NewIdentityHandler(router *gin.Engine, jwtHelper *helpers.JwtHelper, identityService *services.IdentityService) *IdentityHandler {

	handler := &IdentityHandler{
		router,
		identityService,
	}

	router.POST("/account/create", handler.CreateAccount)
	router.POST("/account/signin", handler.SignInAccount)
	router.GET("/account/me", jwtHelper.RequireAuth(), handler.GetCurrentAccount)

	return handler
}

// CreateAccount godoc
// @Summary Create a new account
// @Description Create a new user account with the provided information
// @Tags Identity
// @Accept json
// @Produce json
// @Param request body services.CreateAccountForm true "Account creation details"
// @Success 200 {object} map[string]interface{} "Account created successfully"
// @Failure 400 {object} problems.Problem "Invalid request body"
// @Failure 500 {object} problems.Problem "Internal server error"
// @Router /account/create [post]
func (handler *IdentityHandler) CreateAccount(ctx *gin.Context) {
	var form services.CreateAccountForm

	if err := ctx.BindJSON(&form); err != nil {
		ctx.JSON(http.StatusBadRequest, problems.NewProblem(http.StatusBadRequest, "Invalid request body"))
		return
	}

	data, problem := handler.identityService.CreateAccount(form)

	if problem != nil {
		ctx.JSON(problem.Status, problem)
		return
	}

	ctx.JSON(http.StatusOK, data)
}

// SignInAccount godoc
// @Summary Sign in to an account
// @Description Sign in to an existing user account with the provided credentials
// @Tags Identity
// @Accept json
// @Produce json
// @Param request body services.SignInForm true "Account sign-in credentials"
// @Success 200 {object} map[string]interface{} "Account signed in successfully"
// @Failure 400 {object} problems.Problem "Invalid request body"
// @Failure 500 {object} problems.Problem "Internal server error"
// @Router /account/signin [post]
func (handler *IdentityHandler) SignInAccount(ctx *gin.Context) {
	var form services.SignInForm

	if err := ctx.BindJSON(&form); err != nil {
		ctx.JSON(http.StatusBadRequest, problems.NewProblem(http.StatusBadRequest, "Invalid request body"))
		return
	}

	data, problem := handler.identityService.SignInAccount(form)

	if problem != nil {
		ctx.JSON(problem.Status, problem)
		return
	}

	ctx.JSON(http.StatusOK, data)
}

// GetCurrentAccount godoc
// @Summary Get current account information
// @Description Get information about the currently authenticated user account
// @Tags Identity
// @Produce json
// @Security ApiKeyAuth
// @Success 200 {object} map[string]interface{} "Account information retrieved successfully"
// @Failure 401 {object} problems.Problem "User not authenticated"
// @Failure 500 {object} problems.Problem "Internal server error"
// @Router /account/me [get]
func (handler *IdentityHandler) GetCurrentAccount(ctx *gin.Context) {
	claims, exists := ctx.Get("claims")

	if !exists {
		ctx.JSON(http.StatusUnauthorized, problems.NewProblem(http.StatusUnauthorized, "Unauthorized access"))
		return
	}

	sub, ok := claims.(map[string]any)["sub"].(string)

	if !ok {
		ctx.JSON(http.StatusUnauthorized, problems.NewProblem(http.StatusUnauthorized, "Unauthorized access"))
		return
	}

	data, problem := handler.identityService.GetAccountById(sub)

	if problem != nil {
		ctx.JSON(problem.Status, problem)
		return
	}

	ctx.JSON(http.StatusOK, data)
}
