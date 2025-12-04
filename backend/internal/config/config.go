package config

import (
	"flag"
	"github.com/ilyakaznacheev/cleanenv"
	"os"
	"time"
)

const (
	DefaultMaxOpenConns int32         = 25
	DefaultMaxLifetime  time.Duration = 5 * time.Minute
	DefaultMaxIdleTime  time.Duration = 1 * time.Minute
	DefaultHTTPPort     int           = 8090
)

type Config struct {
	Postgres  PostgresConfig `yaml:"postgres"`
	Port      int            `yaml:"port"`
	SecretJWT string         `yaml:"secret_jwt"`
	TgBot     TGBotConfig    `yaml:"tg"`
}

type PostgresConfig struct {
	DSN          string        `yaml:"dsn"`
	MaxOpenConns int32         `yaml:"max_open_conns"`
	MaxLifetime  time.Duration `yaml:"max_lifetime"`
	MaxIdleTime  time.Duration `yaml:"max_idle_time"`
}

type TGBotConfig struct {
	Token   string `yaml:"token"`
	Timeout int    `yaml:"timeout"`
}

func MustLoad() Config {
	path := fetchConfigPath()

	if path == "" {
		panic("config path is empty")
	}

	return MustLoadByPath(path)
}

func MustLoadByPath(path string) Config {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		panic("config file does not exist: " + path)
	}

	var cfg Config

	if err := cleanenv.ReadConfig(path, &cfg); err != nil {
		panic("failed to read config: " + err.Error())
	}

	return cfg
}

func fetchConfigPath() string {
	var res string

	flag.StringVar(&res, "config", "", "path to config file")
	flag.Parse()

	if res == "" {
		res = os.Getenv("CONFIG_PATH")
	}

	return res
}
