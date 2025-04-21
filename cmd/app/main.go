package main

import (
	"fmt"
	"log"
	"os"

	_ "github.com/prince272/konabra/docs/swagger"
	"github.com/prince272/konabra/internal/app"
	"github.com/prince272/konabra/internal/handlers"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/internal/services"
)

// @title       Example API
// @version     1.0
// @description This is a sample server using Gin and Swagger. CLI => swag init -g cmd/app/main.go -o ./docs/swagger
// @host        localhost:8080
// @BasePath    /
func main() {

	wd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Error getting working directory: %v", err)
	}

	fmt.Println("Current working directory:", wd)
	// Create a new instance of the application
	myApp := app.New()

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
