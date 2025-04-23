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
	Logging struct {
		Level  string `mapstructure:"LOG_LEVEL"`
		Output string `mapstructure:"LOG_OUTPUT"`
	} `mapstructure:",squash"`
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

// Logger constructor (depends on Config)
func buildLogger(container *di.Container) func() *zap.Logger {
	return func() *zap.Logger {
		config := di.MustGet[*Config](container)

		// Determine log level
		var level zapcore.Level
		if err := level.UnmarshalText([]byte(config.Logging.Level)); err != nil {
			level = zapcore.InfoLevel // fallback default
		}

		// Determine log output
		lumberjackLogger := &lumberjack.Logger{
			Filename:   config.Logging.Output,
			MaxSize:    10, // MB
			MaxBackups: 5,
			MaxAge:     28, // days
			Compress:   true,
		}
		fileWS := zapcore.AddSync(lumberjackLogger)

		// Encoders
		consoleCfg := zap.NewDevelopmentEncoderConfig()
		consoleCfg.EncodeLevel = zapcore.CapitalColorLevelEncoder
		consoleCfg.EncodeTime = zapcore.ISO8601TimeEncoder
		consoleEncoder := zapcore.NewConsoleEncoder(consoleCfg)

		fileCfg := zap.NewProductionEncoderConfig()
		fileCfg.EncodeTime = zapcore.ISO8601TimeEncoder
		fileEncoder := zapcore.NewJSONEncoder(fileCfg)

		core := zapcore.NewTee(
			zapcore.NewCore(consoleEncoder, zapcore.Lock(os.Stdout), level), // always to console
			zapcore.NewCore(fileEncoder, fileWS, level),                     // to file
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

	// Config first (because Logger needs it)
	if err := container.Register(buildConfig()); err != nil {
		panic(err)
	}

	// Logger (after config)
	if err := container.Register(buildLogger(container)); err != nil {
		panic(err)
	}

	// Router, Validator, DB
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

	// Attach zap middleware
	router.Use(ginzap.Ginzap(logger, time.RFC3339, true))
	router.Use(ginzap.RecoveryWithZap(logger, true))

	logger.Info("Starting HTTP server...")
	if err := router.Run(); err != nil {
		logger.Fatal("Server failed to start", zap.Error(err))
	}
}
