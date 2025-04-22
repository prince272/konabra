package main

import (
	_ "github.com/prince272/konabra/docs/swagger"
	"github.com/prince272/konabra/internal/app"
	"github.com/prince272/konabra/internal/handlers"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/internal/services"
)

var myApp *app.App

// @title       Example API
// @version     1.0
// @description This is a sample server using Gin and Swagger.
// @host        localhost:8080
// @BasePath    /

func init() {
	// Initialize the application with a new container
	myApp = app.New()
}

func main() {
	// Register repositories in the application's container
	myApp.Register(repositories.NewIdentityRepository)

	// Register services in the application's container
	myApp.Register(services.NewIdentityService)

	// Register handlers in the application's container
	myApp.Handle(handlers.NewSwaggerHandler)
	myApp.Handle(handlers.NewIdentityHandler)

	// Run the application (starts the server and handles requests)
	myApp.Run()
}
