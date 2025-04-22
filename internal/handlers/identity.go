package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/services"
	"github.com/prince272/konabra/pkg/di"
	"github.com/prince272/konabra/pkg/problems"
)

type IdentityHandler struct {
}

func NewIdentityHandler(cnt *di.Container) *IdentityHandler {
	router := di.MustGet[*gin.Engine](cnt)

	router.POST("/account/create", func(ctx *gin.Context) { createAccount(ctx, cnt) })

	return &IdentityHandler{}
}

// CreateAccount godoc
// @Summary Create a new account
// @Description Create a new user account with the provided information
// @Tags account
// @Accept json
// @Produce json
// @Param request body services.CreateAccountForm true "Account creation details"
// @Success 200 {object} map[string]interface{} "Account created successfully"
// @Failure 400 {object} problems.Problem "Invalid request body"
// @Failure 500 {object} problems.Problem "Internal server error"
// @Router /account/create [post]
func createAccount(ctx *gin.Context, cnt *di.Container) {
	var form *services.CreateAccountForm

	if err := ctx.ShouldBindBodyWithJSON(&form); err != nil {
		ctx.JSON(http.StatusBadRequest, problems.NewProblem(
			http.StatusBadRequest,
			"Invalid request body.",
			ctx.Request.URL.Path,
		))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{})
}
