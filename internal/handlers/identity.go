package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/services"
	"github.com/prince272/konabra/pkg/di"
	"github.com/prince272/konabra/pkg/problems"
)

type IdentityHandler struct {
	router  *gin.Engine
	service *services.IdentityService
}

func NewIdentityHandler(cnt *di.Container) *IdentityHandler {
	router := di.MustGet[*gin.Engine](cnt)

	handler := &IdentityHandler{
		router:  router,
		service: di.MustGet[*services.IdentityService](cnt),
	}

	router.POST("/account/create", handler.CreateAccount)

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
	var form *services.CreateAccountForm

	if err := ctx.ShouldBindBodyWithJSON(&form); err != nil {
		ctx.JSON(http.StatusBadRequest, problems.NewProblem(
			http.StatusBadRequest,
			"Invalid request body.",
		))
		return
	}

	data, problem := handler.service.CreateAccount(form)

	if problem != nil {
		ctx.JSON(problem.Status, problem)
		return
	}

	ctx.JSON(http.StatusOK, data)
}
