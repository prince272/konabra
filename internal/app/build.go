package app

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/pkg/di"
)

type App struct {
	container *di.Container
	router    *gin.Engine
}

func newRouter() *gin.Engine {
	router := gin.New()
	return router
}

func newContainer() *di.Container {
	container := di.New()
	return container
}

func buildConfig() *Config {
	config := &Config{}
	return config
}

func New() *App {
	container := newContainer()

	if err := container.Register(buildConfig); err != nil {
		panic(err)
	}

	if err := container.Register(newRouter); err != nil {
		panic(err)
	}

	return &App{
		container: container,
		router:    di.MustGet[*gin.Engine](container),
	}
}

func (app *App) Register(constructor any) {
	err := app.container.Register(constructor)
	if err != nil {
		panic(err)
	}
}

func (app *App) Handle(handler any) {
	err := app.container.Handle(handler)
	if err != nil {
		panic(err)
	}
}

func (app *App) Run() {
	err := app.router.Run()
	if err != nil {
		panic(fmt.Errorf("failed to run server: %w", err))
	}
}
