package models

import "time"

type WeatherForecast struct {
	Date         time.Time
	TemperatureC int
	Summary      string
}

func (wf *WeatherForecast) TemperatureF() int {
	return 32 + int(float64(wf.TemperatureC)/0.5556)
}
