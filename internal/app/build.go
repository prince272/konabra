package app

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/prince272/konabra/pkg/di"
	"github.com/spf13/viper"
	"gorm.io/driver/sqlite"
	_ "gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type App struct {
	container *di.Container
}

// Router constructor
func buildRouter() func() *gin.Engine {
	return func() *gin.Engine {
		router := gin.New()
		// You can set up middleware, routes etc. here
		return router
	}
}

// Config constructor
func buildConfig() func() *Config {
	return func() *Config {
		v := viper.New()

		paths := getPossiblePaths(".env")
		if len(paths) > 0 {
			v.SetConfigFile(paths[0])
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
}

func getPossiblePaths(relPath string) []string {
	// Get the working directory
	wd, err := os.Getwd()
	if err != nil {
		panic(fmt.Errorf("failed to get working directory: %w", err))
	}

	// Get the application directory
	// Assuming the application directory is the directory containing the executable
	appDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(fmt.Errorf("failed to get application directory: %w", err))
	}

	// List of possible paths: relative path, working directory path, and application directory path
	candidates := []string{
		filepath.Join(wd, relPath),
		filepath.Join(appDir, relPath),
	}

	var validPaths []string
	for _, path := range candidates {
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			validPaths = append(validPaths, path)
		}
	}

	return validPaths
}

// Default DB constructor
func buildDefaultDB(container *di.Container) func() *gorm.DB {
	return func() *gorm.DB {
		config := di.MustGet[*Config](container)

		// Get the possible paths for the database file
		paths := getPossiblePaths(config.Databases.Default)

		if len(paths) <= 0 {
			panic(fmt.Errorf("failed to find database file: %s", config.Databases.Default))
		}

		// Open the database connection
		sqlFilePath := paths[0]
		db, err := gorm.Open(sqlite.Open(sqlFilePath), &gorm.Config{})

		if err != nil {
			panic(fmt.Errorf("failed to connect to database 'default.db': %w", err))
		}

		return db
	}
}

func New() *App {
	container := di.New()

	if err := container.Register(func() *di.Container {
		return container
	}); err != nil {
		panic(err)
	}

	if err := container.Register(buildConfig()); err != nil {
		panic(err)
	}

	if err := container.Register(buildRouter()); err != nil {
		panic(err)
	}

	if err := container.RegisterWithKey("DefaultDB", buildDefaultDB(container)); err != nil {
		panic(err)
	}

	return &App{
		container: container,
	}
}

func (app *App) Register(constructor any) {
	if err := app.container.Register(constructor); err != nil {
		panic(err)
	}
}

func (app *App) Handle(handler any) {
	if err := app.container.Handle(handler); err != nil {
		panic(err)
	}
}

func (app *App) Run() {
	router := di.MustGet[*gin.Engine](app.container)
	if err := router.Run(); err != nil {
		panic(fmt.Errorf("failed to run server: %w", err))
	}
}
