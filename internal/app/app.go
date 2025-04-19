package app

import (
	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/pkg/di"
)

type App struct {
	Container *di.Container
	Router    *gin.Engine
}

func newRouter() *gin.Engine {
	router := gin.New()
	return router
}

func newContainer() *di.Container {
	container := di.New()
	return container
}

func New() *App {
	container := newContainer()
	container.Register(newRouter)
	return &App{
		Container: container,
		Router:    di.MustGet[*gin.Engine](container),
	}
}

func (app *App) Run() {
	app.Router.Run()
}
