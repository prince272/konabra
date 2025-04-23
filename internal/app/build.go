package app

import (
	"fmt"
	"os"
	"time"

	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/prince272/konabra/pkg/di"
	"github.com/prince272/konabra/utils"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type App struct {
	container *di.Container
}

type Config struct {
	App struct {
		Name string `mapstructure:"APP_NAME"`
		Env  string `mapstructure:"APP_ENV"`
		Port int    `mapstructure:"APP_PORT"`
	}
	Databases struct {
		Default string `mapstructure:"DB_DEFAULT"`
	} `mapstructure:",squash"`
}

// Logger constructor with Lumberjack file rotation
func buildLogger() func() *zap.Logger {
	return func() *zap.Logger {
		// Lumberjack logger for rotating file output
		lumberjackLogger := &lumberjack.Logger{
			Filename:   "app.log", // log file name
			MaxSize:    10,        // megabytes (maximum size before rotation)
			MaxBackups: 5,         // number of old files to keep
			MaxAge:     28,        // days (how long to retain old files)
			Compress:   true,      // compress old logs
		}

		// Console encoder (colorized for development)
		consoleCfg := zap.NewDevelopmentEncoderConfig()
		consoleCfg.EncodeLevel = zapcore.CapitalColorLevelEncoder
		consoleCfg.EncodeTime = zapcore.ISO8601TimeEncoder
		consoleEncoder := zapcore.NewConsoleEncoder(consoleCfg)

		// File encoder (structured JSON)
		fileCfg := zap.NewProductionEncoderConfig()
		fileCfg.EncodeTime = zapcore.ISO8601TimeEncoder
		fileEncoder := zapcore.NewJSONEncoder(fileCfg)

		// Tie encoders to outputs
		consoleWS := zapcore.Lock(os.Stdout)
		fileWS := zapcore.AddSync(lumberjackLogger)

		// Combine cores (console + file output)
		core := zapcore.NewTee(
			zapcore.NewCore(consoleEncoder, consoleWS, zapcore.InfoLevel),
			zapcore.NewCore(fileEncoder, fileWS, zapcore.InfoLevel),
		)

		return zap.New(core, zap.AddCaller())
	}
}

// Router constructor
func buildRouter() func() *gin.Engine {
	return func() *gin.Engine {
		router := gin.New()
		return router
	}
}

// Config constructor
func buildConfig() func() *Config {
	return func() *Config {
		v := viper.New()
		paths := utils.GetPossiblePaths(".env")
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

// Validator constructor
func buildValidate() func() *validator.Validate {
	return func() *validator.Validate {
		validate := validator.New()
		validate.RegisterValidation("password", utils.ValidatePassword)
		return validate
	}
}

// Default DB constructor
func buildDefaultDB(container *di.Container) func() *gorm.DB {
	return func() *gorm.DB {
		config := di.MustGet[*Config](container)
		paths := utils.GetPossiblePaths(config.Databases.Default)
		if len(paths) == 0 {
			panic(fmt.Errorf("failed to find database file: %s", config.Databases.Default))
		}
		db, err := gorm.Open(sqlite.Open(paths[0]), &gorm.Config{})
		if err != nil {
			panic(fmt.Errorf("failed to connect to database: %w", err))
		}
		return db
	}
}

// New creates the application and registers core dependencies
func New() *App {
	container := di.New()

	// Self
	if err := container.Register(func() *di.Container {
		return container
	}); err != nil {
		panic(err)
	}

	// Logger
	if err := container.Register(buildLogger()); err != nil {
		panic(err)
	}

	// Config, Router, Validator, DB
	if err := container.Register(buildConfig()); err != nil {
		panic(err)
	}
	if err := container.Register(buildRouter()); err != nil {
		panic(err)
	}
	if err := container.Register(buildValidate()); err != nil {
		panic(err)
	}
	if err := container.RegisterWithKey("DefaultDB", buildDefaultDB(container)); err != nil {
		panic(err)
	}

	return &App{container: container}
}

// Register additional constructors
func (app *App) Register(constructor any) {
	if err := app.container.Register(constructor); err != nil {
		panic(err)
	}
}

// Handle registers handlers
func (app *App) Handle(handler any) {
	if err := app.container.Handle(handler); err != nil {
		panic(err)
	}
}

// Run starts the HTTP server with request-logging middleware
func (app *App) Run() {
	router := di.MustGet[*gin.Engine](app.container)
	logger := di.MustGet[*zap.Logger](app.container)

	// Attach zap middleware for logging and panic recovery
	router.Use(ginzap.Ginzap(logger, time.RFC3339, true))
	router.Use(ginzap.RecoveryWithZap(logger, true))

	logger.Info("Starting HTTP server on default port...")
	if err := router.Run(); err != nil {
		logger.Fatal("Server failed to start", zap.Error(err))
	}
}
