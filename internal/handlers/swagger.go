package handlers

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type SwaggerHandler struct{}

func NewSwaggerHandler(router *gin.Engine) *SwaggerHandler {
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	return &SwaggerHandler{}
}
