package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/services"
)

type WeatherForecastHandler struct {
}

func NewWeatherForecastHandler(router *gin.Engine, weatherForecastService *services.WeatherService) *WeatherForecastHandler {

	router.GET("/weatherforecast", func(c *gin.Context) {
		c.JSON(http.StatusOK, weatherForecastService.GetForecasts(10))
	})

	return &WeatherForecastHandler{}
}
