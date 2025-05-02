package builds

import (
	"fmt"
	"net/http"
	"os"
	"time"

	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/knadh/koanf/parsers/dotenv"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
	models "github.com/prince272/konabra/internal/models/identity"
	"github.com/prince272/konabra/pkg/di"
	"github.com/prince272/konabra/pkg/problems"
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
	Env       string `koanf:"ENV"`
	Port      string `koanf:"PORT"`
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

		var cfg *Config
		if err := k.Unmarshal("", &cfg); err != nil {
			panic(fmt.Errorf("error unmarshaling config: %w", err))
		}

		if cfg.Env == "" {
			cfg.Env = "development"
		}

		if cfg.Port == "" {
			cfg.Port = "8080"
		}

		return cfg
	}
}

func buildLogger(container *di.Container) func() *zap.Logger {
	return func() *zap.Logger {
		cfg := di.MustGet[*Config](container)

		var level zapcore.Level
		if err := level.UnmarshalText([]byte(cfg.LogLevel)); err != nil {
			level = zapcore.InfoLevel
		}

		isDev := cfg.Env == "development"
		encoderCfg := zap.NewProductionEncoderConfig()
		if isDev {
			encoderCfg = zap.NewDevelopmentEncoderConfig()
		}

		cores := []zapcore.Core{
			zapcore.NewCore(
				zapcore.NewConsoleEncoder(encoderCfg),
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

		if err := db.AutoMigrate(&models.User{}, &models.Role{}); err != nil {
			panic(fmt.Errorf("auto migration failed: %w", err))
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
		if err := validate.RegisterValidation("username", utils.ValidateUsername); err != nil {
			panic(fmt.Errorf("failed to register username validator: %w", err))
		}

		if err := validate.RegisterValidation("password", utils.ValidatePassword); err != nil {
			panic(fmt.Errorf("failed to register password validator: %w", err))
		}
		return validate
	}
}

func buildRouter(container *di.Container) func() *gin.Engine {
	return func() *gin.Engine {
		router := gin.New()
		logger := di.MustGet[*zap.Logger](container)

		// Add middleware
		router.Use(gin.CustomRecovery(func(c *gin.Context, unknownErr any) {
			var err error
			switch e := unknownErr.(type) {
			case error:
				err = e
			default:
				err = fmt.Errorf("%v", unknownErr)
			}

			logger.Error("Panic recovered",
				zap.Any("error", err),
				zap.String("method", c.Request.Method),
				zap.String("path", c.Request.URL.Path),
				zap.Int("status_code", http.StatusInternalServerError),
			)
			c.JSON(http.StatusInternalServerError, problems.NewInternalServerProblemFromError(err))
		}))
		router.Use(ginzap.Ginzap(logger, time.RFC3339, true))
		router.Use(ginzap.RecoveryWithZap(logger, true))

		return router
	}
}

func NewApi() *Api {
	container := di.New()

	if err := container.Register(func() *di.Container {
		return container
	}); err != nil {
		panic(fmt.Errorf("failed to register container: %w", err))
	}

	if err := container.Register(buildConfig()); err != nil {
		panic(fmt.Errorf("failed to register config: %w", err))
	}

	if err := container.Register(buildLogger(container)); err != nil {
		panic(fmt.Errorf("failed to register logger: %w", err))
	}

	if err := container.Register(buildValidator()); err != nil {
		panic(fmt.Errorf("failed to register validator: %w", err))
	}

	if err := container.RegisterWithKey("DefaultDB", buildDefaultDB(container)); err != nil {
		panic(fmt.Errorf("failed to register default DB: %w", err))
	}

	if err := container.Register(buildRouter(container)); err != nil {
		panic(fmt.Errorf("failed to register Gin engine: %w", err))
	}

	return &Api{container: container}
}

func (api *Api) Register(constructor any) {
	if err := api.container.Register(constructor); err != nil {
		panic(fmt.Errorf("failed to register constructor: %w", err))
	}
}

func (api *Api) Run() {
	router := di.MustGet[*gin.Engine](api.container)
	cfg := di.MustGet[*Config](api.container)

	port := cfg.Port
	addr := fmt.Sprintf(":%s", port)

	if err := router.Run(addr); err != nil {
		panic(fmt.Errorf("server failed: %w", err))
	}
}
