package main

import (
	_ "github.com/prince272/konabra/docs/swagger"
	"github.com/prince272/konabra/internal/builds"
	"github.com/prince272/konabra/internal/handlers"
	"github.com/prince272/konabra/internal/repositories"
	"github.com/prince272/konabra/internal/services"
)

// @title       Konabra API
// @version     1.0
// @description Konabra is a smart, community-powered transport and road safety platform for Ghana. This API supports live incident reporting, road condition updates, and data analytics integration.
// @BasePath    /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Initialize the API application
	api := builds.NewApi()

	// Register the configuration for the application
	api.RegisterCore()

	// Register repositories in the application's container
	api.Register(repositories.NewIdentityRepository)
	api.Register(repositories.NewCategoryRepository)
	api.Register(repositories.NewIncidentRepository)

	// Register services in the application's container
	api.Register(services.NewIdentityService)
	api.Register(services.NewCategoryService)
	api.Register(services.NewIncidentService)

	// Register handlers in the application's container
	api.Register(handlers.NewSwaggerHandler)
	api.Register(handlers.NewIdentityHandler)
	api.Register(handlers.NewCategoryHandler)
	api.Register(handlers.NewIncidentHandler)

	// Run the application (starts the server and handles requests)
	api.Run()
}
