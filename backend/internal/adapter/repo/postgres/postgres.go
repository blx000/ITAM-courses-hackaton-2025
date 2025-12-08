package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/config"
	migrations "github.com/blx000/ITAM-courses-hackaton-2025/pkg/migrations/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func NewPostgresPool(ctx context.Context, cfg config.PostgresConfig) (*pgxpool.Pool, error) {
	db, err := sql.Open("pgx", cfg.DSN)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to postgres: %w", err)
	}

	if err := migrations.Migrate(db); err != nil {
		return nil, fmt.Errorf("failed to apply migrations: %w", err)
	}

	if err = db.Close(); err != nil {
		return nil, fmt.Errorf("failed to close connection: %w", err)
	}

	pgxConfig, err := pgxpool.ParseConfig(cfg.DSN)
	if err != nil {
		return nil, fmt.Errorf("failed to parse postgres config: %w", err)
	}

	pgxConfig.MaxConns = cfg.MaxOpenConns
	pgxConfig.MaxConnIdleTime = cfg.MaxIdleTime
	pgxConfig.MaxConnLifetime = cfg.MaxLifetime

	pool, err := pgxpool.NewWithConfig(ctx, pgxConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to postgres: %w", err)
	}

	return pool, nil
}
