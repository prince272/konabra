package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/services"
	"github.com/prince272/konabra/pkg/di"
)

type IdentityHandler struct {
}

func NewIdentityHandler(container *di.Container) *IdentityHandler {
	router := di.MustGet[*gin.Engine](container)

	router.GET("/identity", func(c *gin.Context) {
		di.MustGet[*services.IdentityService](container)
		c.JSON(http.StatusOK, nil)
	})

	return &IdentityHandler{}
}
