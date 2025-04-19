package main

import (
	"github.com/prince272/konabra/internal/app"
	"github.com/prince272/konabra/internal/handlers"
	"github.com/prince272/konabra/internal/services"
)

func main() {
	// Create a new instance of the application
	myApp := app.New()

	// Register services in the application's container
	myApp.Container.Register(services.NewWeatherService)

	// Register handlers in the application's container
	myApp.Container.Handle(handlers.NewWeatherForecastHandler)

	// Run the application (starts the server and handles requests)
	myApp.Run()
}
