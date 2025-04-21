package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/internal/services"
	"github.com/prince272/konabra/pkg/di"
)

// WeatherForecastHandler handles weather forecast endpoints.
type WeatherForecastHandler struct {
}

// NewWeatherForecastHandler sets up the weather forecast route.
// @Summary      Get Weather Forecasts
// @Description  Returns a list of weather forecasts.
// @Tags         Weather
// @Produce      json
// @Success      200  {array}  services.WeatherForecast
// @Router       /weatherforecast [get]
func NewWeatherForecastHandler(router *gin.Engine, container *di.Container) *WeatherForecastHandler {
	router.GET("/weatherforecast", func(c *gin.Context) {
		weatherForecastService := di.MustGet[*services.WeatherService](container)
		c.JSON(http.StatusOK, weatherForecastService.GetForecasts(10))
	})

	return &WeatherForecastHandler{}
}
