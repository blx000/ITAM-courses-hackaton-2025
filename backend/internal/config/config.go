package config

import "time"

const (
	DefaultMaxOpenConns      int32         = 25
	DefaultMaxLifetime       time.Duration = 5 * time.Minute
	DefaultMaxIdleTime       time.Duration = 1 * time.Minute
	DefaultSchedulerInterval time.Duration = 1 * time.Minute
	DefaultHTTPPort          string        = ":8090"
)

type Config struct {
	Postgres PostgresConfig
	Port     int
}

type PostgresConfig struct {
	DSN          string        `yaml:"dsn"`
	MaxOpenConns int32         `yaml:"max_open_conns"`
	MaxLifetime  time.Duration `yaml:"max_lifetime"`
	MaxIdleTime  time.Duration `yaml:"max_idle_time"`
}
