package builds

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"github.com/knadh/koanf/parsers/dotenv"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
	"github.com/prince272/konabra/internal/helpers"
	models "github.com/prince272/konabra/internal/models"

	"github.com/prince272/konabra/internal/problems"
	"github.com/prince272/konabra/pkg/di"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Api struct {
	container *di.Container
}

type Config struct {
	Env          string `koanf:"ENV"`
	Port         string `koanf:"PORT"`
	AllowOrigins string `koanf:"ALLOW_ORIGINS"`

	DbDefault string `koanf:"DB_DEFAULT"`

	LogLevel string `koanf:"LOG_LEVEL"`
	LogFile  string `koanf:"LOG_OUTPUT"`

	JwtAuthSecret   string `koanf:"JWT_AUTH_SECRET"`
	JwtAUthIssuer   string `koanf:"JWT_AUTH_ISSUER"`
	JwtAuthAudience string `koanf:"JWT_AUTH_AUDIENCE"`

	EncryptKey string `koanf:"ENCRYPT_KEY"`

	SmtpHost     string `koanf:"SMTP_HOST"`
	SmtpPort     int    `koanf:"SMTP_PORT"`
	SmtpUsername string `koanf:"SMTP_USERNAME"`
	SmtpPassword string `koanf:"SMTP_PASSWORD"`
}

func (config *Config) IsDevelopment() bool {
	return config.Env == "development"
}

func (config *Config) IsProduction() bool {
	return config.Env == "production"
}

func (api *Api) registerConfig() error {

	k := koanf.New(".")

	// Try loading .env file (optional)
	if _, err := os.Stat(".env"); err == nil {
		if err := k.Load(file.Provider(".env"), dotenv.Parser()); err != nil {
			return fmt.Errorf("error loading .env file: %w", err)
		}
		fmt.Println("Loaded .env file")
	}

	// Load environment variables
	if err := k.Load(env.Provider("", ".", func(s string) string {
		return s
	}), nil); err != nil {
		return fmt.Errorf("error loading env vars: %w", err)
	}

	fmt.Println("Loaded environment variables")

	var cfg *Config
	if err := k.Unmarshal("", &cfg); err != nil {
		return fmt.Errorf("error unmarshaling config: %w", err)
	}

	if cfg.Env == "" {
		cfg.Env = "development"
	}

	if cfg.Port == "" {
		cfg.Port = "8000"
	}

	return api.container.Register(func() *Config {
		return cfg
	})
}

func (api *Api) registerLogger() error {
	cfg := di.MustGet[*Config](api.container)

	var level zapcore.Level
	if err := level.UnmarshalText([]byte(cfg.LogLevel)); err != nil {
		level = zapcore.InfoLevel
	}

	isDev := cfg.IsDevelopment()
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

	return api.container.Register(func() *zap.Logger {
		return zap.New(zapcore.NewTee(cores...), zap.AddCaller())
	})
}

func (api *Api) registerSmtp() error {
	cfg := di.MustGet[*Config](api.container)

	smtp, err := helpers.NewSmtp(helpers.SmtpOptions{
		Host:     cfg.SmtpHost,
		Port:     cfg.SmtpPort,
		Username: cfg.SmtpUsername,
		Password: cfg.SmtpPassword,
	})

	if err != nil {
		return err
	}

	return api.container.Register(func() *helpers.Smtp {
		return smtp
	})
}

func (api *Api) registerState() error {
	return api.container.Register(func() *helpers.State {
		return helpers.NewState()
	})
}

type DefaultDB struct {
	*gorm.DB
}

func (api *Api) registerDefaultDB() error {

	cfg := di.MustGet[*Config](api.container)

	if cfg.DbDefault == "" {
		return fmt.Errorf("default database path not configured")
	}
	db, err := gorm.Open(postgres.Open(cfg.DbDefault), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.AutoMigrate(&models.User{}, &models.Role{}, &models.JwtToken{}, &models.Category{}); err != nil {
		return fmt.Errorf("auto migration failed: %w", err)
	}

	sqlDB, err := db.DB()

	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return api.container.Register(func() *DefaultDB {
		return &DefaultDB{DB: db}
	})
}

func (api *Api) registerRouter() error {

	router := gin.New()
	logger := di.MustGet[*zap.Logger](api.container)
	config := di.MustGet[*Config](api.container)

	// Add middlewares
	router.Use(ginzap.RecoveryWithZap(logger, true))
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
		c.JSON(http.StatusInternalServerError, problems.FromError(err))
	}))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     strings.Split(config.AllowOrigins, ","),
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, problems.NewProblem(http.StatusNotFound, "The requested resource was not found on this server."))
	})

	return api.container.Register(func() *gin.Engine {
		return router
	})
}

func (api *Api) registerValidator() error {
	validator, err := helpers.NewValidator()

	if err != nil {
		return err
	}

	return api.container.Register(func() *helpers.Validator {
		return validator
	})
}

func (api *Api) registerJwtHelper() error {

	cfg := di.MustGet[*Config](api.container)
	defaultDB := di.MustGet[*DefaultDB](api.container)
	logger := di.MustGet[*zap.Logger](api.container)

	options := helpers.JwtOptions{
		Secret:   cfg.JwtAuthSecret,
		Audience: strings.Split(cfg.JwtAuthAudience, ","),
		Issuer:   cfg.JwtAUthIssuer,
	}

	return api.container.Register(func() *helpers.JwtHelper {
		return helpers.NewJwtHelper(options, defaultDB.DB, logger)
	})
}

func NewApi() *Api {
	container := di.New()
	return &Api{container: container}
}

func (api *Api) Register(constructor any) {
	if err := api.container.Register(constructor); err != nil {
		panic(fmt.Errorf("failed to register constructor: %w", err))
	}
}

func (api *Api) RegisterCore() {

	services := []func() error{
		api.registerConfig,
		api.registerLogger,
		api.registerSmtp,
		api.registerState,
		api.registerDefaultDB,
		api.registerJwtHelper,
		api.registerValidator,
		api.registerRouter,
	}

	for _, service := range services {
		if err := service(); err != nil {
			panic(fmt.Errorf("failed to register core service: %w", err))
		}
	}
}

func (api *Api) Run() {
	router := di.MustGet[*gin.Engine](api.container)
	cfg := di.MustGet[*Config](api.container)

	port := cfg.Port
	addr := fmt.Sprintf(":%v", port)

	if err := router.Run(addr); err != nil {
		panic(fmt.Errorf("server failed: %w", err))
	}
}
