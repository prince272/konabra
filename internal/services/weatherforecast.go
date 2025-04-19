package services

import (
	"math/rand"
	"time"
)

type WeatherForecast struct {
	Date         time.Time
	TemperatureC int
	Summary      string
}

func (wf *WeatherForecast) TemperatureF() int {
	return 32 + int(float64(wf.TemperatureC)/0.5556)
}

var summaries = []string{
	"Freezing", "Bracing", "Chilly", "Cool", "Mild",
	"Warm", "Balmy", "Hot", "Sweltering", "Scorching",
}

type WeatherService struct {
}

func NewWeatherService() *WeatherService {
	return &WeatherService{}
}

func (ws *WeatherService) GetForecasts(count int) []WeatherForecast {
	forecasts := make([]WeatherForecast, count)

	for i := 0; i < count; i++ {
		forecasts[i] = WeatherForecast{
			Date:         time.Now().AddDate(0, 0, i+1),
			TemperatureC: rand.Intn(75) - 20, // Range: -20 to 54
			Summary:      summaries[rand.Intn(len(summaries))],
		}
	}
	return forecasts
}
