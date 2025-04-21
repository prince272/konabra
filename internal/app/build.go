package app

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/pkg/di"
	"github.com/spf13/viper"
)

type App struct {
	container *di.Container
	router    *gin.Engine
	config    *Config
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
	v := viper.New()

	if _, err := os.Stat(".env"); err == nil {
		v.SetConfigFile(".env")
		v.SetConfigType("env")
		if err := v.ReadInConfig(); err != nil {
			panic(fmt.Errorf("failed to read .env file: %w", err))
		}
	}

	v.AutomaticEnv()

	var config Config
	if err := v.Unmarshal(&config); err != nil {
		panic(fmt.Errorf("failed to unmarshal config: %w", err))
	}

	return &config
}

func New() *App {
	container := newContainer()

	if err := container.Register(func() *di.Container {
		return container
	}); err != nil {
		panic(err)
	}

	if err := container.Register(buildConfig); err != nil {
		panic(err)
	}

	if err := container.Register(newRouter); err != nil {
		panic(err)
	}

	return &App{
		container: container,
		config:    di.MustGet[*Config](container),
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
