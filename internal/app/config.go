package app

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
