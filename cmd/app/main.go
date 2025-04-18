package main

import "github.com/prince272/konabra/internal/app"

func main() {
	// Initialize the application configuration and dependencies
	app.Init()

	// Set up routes and request handlers
	app.MapHandlers()

	// Start the application server
	app.Run()
}
