package user

import (
	"context"
	"errors"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/blx000/ITAM-courses-hackaton-2025/pkg/jwt"
	"time"
)

type UserCase struct {
	userRepo   repo.User
	authRepo   repo.Auth
	hmacSecret string
}

var (
	ErrCodeNotFound = errors.New("auth code not found")
)

func NewUserCase(userRepo repo.User) *UserCase {
	return &UserCase{userRepo: userRepo}
}

func (u *UserCase) LoginUser(ctx context.Context, code string) (string, string, error) {
	authDTO, err := u.authRepo.Read(ctx, code)
	if err != nil {
		if errors.Is(err, repo.ErrAuthCodeNotFound) {
			return "", "", ErrCodeNotFound
		}
		return "", "", fmt.Errorf("Failed to login %w", err)
	}
	user, err := u.userRepo.Read(ctx, authDTO.TelegramId)
	if err != nil {
		if !errors.Is(err, repo.ErrUserNotFound) {
			newUser := &repo.UserDTO{
				ID:        user.ID,
				FirstName: user.FirstName,
				LastName:  user.LastName,
			}
			errCreate := u.userRepo.Create(ctx, newUser)
			if errCreate != nil {
				return "", "", fmt.Errorf("Failed to create user: %w", errCreate)
			}
			user.ID = newUser.ID
			user.FirstName = newUser.FirstName
			user.LastName = newUser.LastName
		}
		return "", "", fmt.Errorf("Failed to login %w", err)
	}
	accessToken, err := jwt.NewToken(user, time.Hour, u.hmacSecret)
	if err != nil {
		return "", "", fmt.Errorf("Failed to create token %w", err)
	}
	refreshToken, err := jwt.NewRefreshToken(user, u.hmacSecret)
	if err != nil {
		return "", "", fmt.Errorf("Failed to create token %w", err)
	}
	return accessToken, refreshToken, nil
}
