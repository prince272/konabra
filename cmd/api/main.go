package main

import (
	_ "github.com/prince272/konabra/docs/swagger"
	"github.com/prince272/konabra/internal/builds"
	"github.com/prince272/konabra/internal/handlers"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/internal/services"
)

var api *builds.Api

// @title       Konabra API
// @version     1.0
// @description Konabra is a smart, community-powered transport and road safety platform for Ghana. This API supports live incident reporting, road condition updates, and data analytics integration.
// @host        localhost:8080
// @BasePath    /
func init() {
	// Initialize the application with a new container
	api = builds.NewApi()
}

func main() {
	// Register repositories in the application's container
	api.Register(repositories.NewIdentityRepository)

	// Register services in the application's container
	api.Register(services.NewIdentityService)

	// Register handlers in the application's container
	api.Register(handlers.NewSwaggerHandler)
	api.Register(handlers.NewIdentityHandler)

	// Run the application (starts the server and handles requests)
	api.Run()
}
