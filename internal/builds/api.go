package builds

import (
	"fmt"
	"os"
	"strings"
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

type Api struct {
	container *di.Container
}

type Config struct {
	Api struct {
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
		envFilePath := ".env"

		v.SetConfigFile(envFilePath)
		v.SetConfigType("env")

		// Try to read the .env file but don't panic if it doesn't exist
		if err := v.ReadInConfig(); err != nil {
			fmt.Fprintf(os.Stderr, "warning: could not load .env file: %v\n", err)
		}

		v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
		v.AutomaticEnv()

		var config Config
		if err := v.Unmarshal(&config); err != nil {
			panic(fmt.Errorf("failed to unmarshal config: %w", err))
		}

		// log all v.keys and values
		for _, key := range v.AllKeys() {
			value := v.Get(key)
			fmt.Printf("Config: %s = %v\n", key, value)
		}
		return &config
	}
}

// Logger constructor (depends on Config)
func buildLogger(container *di.Container) func() *zap.Logger {
	return func() *zap.Logger {
		config := di.MustGet[*Config](container)

		var level zapcore.Level
		if err := level.UnmarshalText([]byte(config.Logging.Level)); err != nil {
			level = zapcore.InfoLevel // default
		}

		// Set up file logging with rotation
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
			zapcore.NewCore(consoleEncoder, zapcore.Lock(os.Stdout), level), // console
			zapcore.NewCore(fileEncoder, fileWS, level),                     // file
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

		dbPath := di.MustGet[*Config](container).Databases.Default

		if dbPath == "" {
			panic("no default database path provided in configuration")
		}

		db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
		if err != nil {
			panic(fmt.Errorf("failed to connect to database at %s: %w", dbPath, err))
		}

		return db
	}
}

// NewApi creates the application and registers core dependencies
func NewApi() *Api {
	container := di.New()

	if err := container.Register(func() *di.Container {
		return container
	}); err != nil {
		panic(err)
	}

	if err := container.Register(buildConfig()); err != nil {
		panic(err)
	}

	if err := container.Register(buildLogger(container)); err != nil {
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

	return &Api{container: container}
}

// Register additional constructors
func (api *Api) Register(constructor any) {
	if err := api.container.Register(constructor); err != nil {
		panic(err)
	}
}

// Run starts the HTTP server with request-logging middleware
func (api *Api) Run(...string) {
	router := di.MustGet[*gin.Engine](api.container)
	logger := di.MustGet[*zap.Logger](api.container)

	router.Use(ginzap.Ginzap(logger, time.RFC3339, true))
	router.Use(ginzap.RecoveryWithZap(logger, true))

	logger.Info("Starting HTTP server...")

	if err := router.Run(); err != nil {
		logger.Fatal("Server failed to start", zap.Error(err))
	}
}
