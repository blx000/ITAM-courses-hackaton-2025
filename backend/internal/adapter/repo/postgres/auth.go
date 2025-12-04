package postgres

import (
	"context"
	"errors"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/huandu/go-sqlbuilder"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

var _ repo.Auth = (*AutRepo)(nil)

type AutRepo struct {
	pool *pgxpool.Pool
}

func NewAuthRepo(pool *pgxpool.Pool) *AutRepo {
	return &AutRepo{
		pool: pool,
	}
}

func (a *AutRepo) Create(ctx context.Context, auth *repo.AuthDto) error {
	ib := sqlbuilder.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("hackmate.auth").
		Cols("code", "user_id", "expires_at").
		Values(auth.Code, auth.TelegramId, auth.ExpiresAt)
	fmt.Println("Code ", auth.Code)
	sql, args := ib.Build()
	_, err := a.pool.Exec(ctx, sql, args...)
	if err != nil {
		fmt.Println(sql)
		fmt.Println(args...)
		return fmt.Errorf("failed to create auth code: %w", err)
	}

	return nil
}

func (a *AutRepo) Read(ctx context.Context, code string) (*repo.AuthDto, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()
	sb.Select("user_id, expires_at").From("hackmate.auth").Where(sb.Equal("code", code))

	sql, args := sb.Build()

	var (
		userId    int64
		expiresAt time.Time
	)

	err := a.pool.QueryRow(ctx, sql, args...).Scan(
		&userId,
		&expiresAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, repo.ErrAuthCodeNotFound
		}
		return nil, fmt.Errorf("failed to read auth code: %w", err)
	}

	return &repo.AuthDto{
		Code:       code,
		TelegramId: userId,
		ExpiresAt:  expiresAt,
	}, nil
}

func (a *AutRepo) DeleteAllExpired(ctx context.Context, diff time.Duration) error {
	db := sqlbuilder.PostgreSQL.NewDeleteBuilder()

	deadLine := time.Now().Add(-diff)

	db.DeleteFrom("hackmate.auth").Where(db.LessThan("expires_at", deadLine))

	sql, args := db.Build()

	_, err := a.pool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete expired auth code: %w", err)
	}
	return nil
}

func (a *AutRepo) DeleteExpired(ctx context.Context, code string) error {
	db := sqlbuilder.PostgreSQL.NewDeleteBuilder()

	db.DeleteFrom("hackmate.auth").Where(db.Equal("code", code))

	sql, args := db.Build()

	_, err := a.pool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete expired auth code: %w", err)
	}
	return nil
}
