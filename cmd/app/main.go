package main

import (
	"github.com/prince272/konabra/internal/app"
	"github.com/prince272/konabra/internal/handlers"
	"github.com/prince272/konabra/internal/services"
)

func main() {
	myApp := app.New()
	myApp.Container.Register(services.NewWeatherService)
	myApp.Container.Handle(handlers.NewWeatherForecastHandler)
	myApp.Run()
}
