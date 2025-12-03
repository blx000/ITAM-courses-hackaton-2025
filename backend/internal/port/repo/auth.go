package repo

import (
	"context"
	"errors"
	"time"
)

var (
	ErrAuthCodeNotFound = errors.New("auth code not found")
)

type Auth interface {
	Create(ctx context.Context, auth *AuthDto) error
	Read(ctx context.Context, code string) (*AuthDto, error)
	DeleteAllExpired(ctx context.Context, diff time.Duration) error
	DeleteExpired(ctx context.Context, code string) error
}

type AuthDto struct {
	Code       string
	TelegramId int64
	ExpiresAt  time.Time
}
