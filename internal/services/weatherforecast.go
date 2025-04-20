package services

import (
	"math/rand"
	"time"

	"github.com/prince272/konabra/internal/models"
)

var summaries = []string{
	"Freezing", "Bracing", "Chilly", "Cool", "Mild",
	"Warm", "Balmy", "Hot", "Sweltering", "Scorching",
}

type WeatherService struct {
}

func NewWeatherService() *WeatherService {
	return &WeatherService{}
}

func (ws *WeatherService) GetForecasts(count int) []models.WeatherForecast {
	forecasts := make([]models.WeatherForecast, count)

	for i := 0; i < count; i++ {
		forecasts[i] = models.WeatherForecast{
			Date:         time.Now().AddDate(0, 0, i+1),
			TemperatureC: rand.Intn(75) - 20, // Range: -20 to 54
			Summary:      summaries[rand.Intn(len(summaries))],
		}
	}
	return forecasts
}
