package main

import (
	_ "github.com/prince272/konabra/docs/swagger"
	"github.com/prince272/konabra/internal/app"
	"github.com/prince272/konabra/internal/handlers"
	"github.com/prince272/konabra/internal/services"
)

// @title       Example API
// @version     1.0
// @description This is a sample server using Gin and Swagger. CLI => swag init -g cmd/app/main.go -o ./docs/swagger
// @host        localhost:8080
// @BasePath    /
func main() {
	// Create a new instance of the application
	myApp := app.New()

	// Register services in the application's container
	myApp.Container.Register(services.NewWeatherService)

	// Register handlers in the application's container
	myApp.Container.Handle(handlers.NewSwaggerHandler)
	myApp.Container.Handle(handlers.NewWeatherForecastHandler)

	// Run the application (starts the server and handles requests)
	myApp.Run()
}
