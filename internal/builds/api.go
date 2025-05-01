package builds

import (
	"fmt"
	"os"
	"time"

	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/knadh/koanf/parsers/dotenv"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
	"github.com/prince272/konabra/pkg/di"
	"github.com/prince272/konabra/utils"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Api struct {
	container *di.Container
}

type Config struct {
	DbDefault string `koanf:"DB_DEFAULT"`
	LogLevel  string `koanf:"LOG_LEVEL"`
	LogFile   string `koanf:"LOG_OUTPUT"`
}

func buildConfig() func() *Config {
	return func() *Config {
		k := koanf.New(".")

		// Try loading .env file (optional)
		if _, err := os.Stat(".env"); err == nil {
			if err := k.Load(file.Provider(".env"), dotenv.Parser()); err != nil {
				panic(fmt.Errorf("error loading .env file: %w", err))
			}
			fmt.Println("Loaded .env file")
		}

		// Load environment variables
		if err := k.Load(env.Provider("", ".", func(s string) string {
			return s
		}), nil); err != nil {
			panic(fmt.Errorf("error loading env vars: %w", err))
		}

		fmt.Println("Loaded environment variables")

		var cfg Config
		if err := k.Unmarshal("", &cfg); err != nil {
			panic(fmt.Errorf("error unmarshaling config: %w", err))
		}

		return &cfg
	}
}

func buildLogger(container *di.Container) func() *zap.Logger {
	return func() *zap.Logger {
		cfg, err := di.Get[*Config](container)
		if err != nil {
			panic(fmt.Errorf("failed to get config: %w", err))
		}

		var level zapcore.Level
		if err := level.UnmarshalText([]byte(cfg.LogLevel)); err != nil {
			level = zapcore.InfoLevel
		}

		cores := []zapcore.Core{
			zapcore.NewCore(
				zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig()),
				zapcore.AddSync(os.Stdout),
				level,
			),
		}

		if cfg.LogFile != "" {
			fileWS := zapcore.AddSync(&lumberjack.Logger{
				Filename:   cfg.LogFile,
				MaxSize:    10, // MB
				MaxBackups: 5,
				MaxAge:     28, // days
				Compress:   true,
			})
			cores = append(cores, zapcore.NewCore(
				zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig()),
				fileWS,
				level,
			))
		}

		return zap.New(zapcore.NewTee(cores...), zap.AddCaller())
	}
}

func buildDefaultDB(container *di.Container) func() *gorm.DB {
	return func() *gorm.DB {

		cfg := di.MustGet[*Config](container)

		if cfg.DbDefault == "" {
			panic("default database path not configured")
		}

		db, err := gorm.Open(sqlite.Open(cfg.DbDefault), &gorm.Config{})
		if err != nil {
			panic(fmt.Errorf("failed to open database: %w", err))
		}

		sqlDB, err := db.DB()
		if err != nil {
			panic(fmt.Errorf("failed to get sql.DB: %w", err))
		}

		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetConnMaxLifetime(time.Hour)

		return db
	}
}

func buildValidator() func() *validator.Validate {
	return func() *validator.Validate {
		validate := validator.New()
		validate.RegisterValidation("password", utils.ValidatePassword)
		return validate
	}
}

func NewApi() *Api {
	container := di.New()

	// Register container itself
	if err := container.Register(func() *di.Container {
		return container
	}); err != nil {
		panic(fmt.Errorf("failed to register container: %w", err))
	}

	// Register config
	if err := container.Register(buildConfig()); err != nil {
		panic(fmt.Errorf("failed to register config: %w", err))
	}

	// Register logger
	if err := container.Register(buildLogger(container)); err != nil {
		panic(fmt.Errorf("failed to register logger: %w", err))
	}

	// Register Gin engine
	if err := container.Register(func() *gin.Engine {
		return gin.New()
	}); err != nil {
		panic(fmt.Errorf("failed to register Gin engine: %w", err))
	}

	// Register validator
	if err := container.Register(buildValidator()); err != nil {
		panic(fmt.Errorf("failed to register validator: %w", err))
	}

	// Register default DB
	if err := container.RegisterWithKey("DefaultDB", buildDefaultDB(container)); err != nil {
		panic(fmt.Errorf("failed to register default DB: %w", err))
	}

	return &Api{container: container}
}

func (api *Api) Register(constructor any) {
	if err := api.container.Register(constructor); err != nil {
		panic(fmt.Errorf("failed to register constructor: %w", err))
	}
}

// Run starts the HTTP server
func (api *Api) Run() {
	router := di.MustGet[*gin.Engine](api.container)
	logger := di.MustGet[*zap.Logger](api.container)

	// Add middleware
	router.Use(ginzap.Ginzap(logger, time.RFC3339, true))
	router.Use(ginzap.RecoveryWithZap(logger, true))

	if err := router.Run(); err != nil {
		panic(fmt.Errorf("server failed: %w", err))
	}
}
