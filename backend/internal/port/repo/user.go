package repo

import (
	"context"
	"errors"
)

var (
	ErrUserNotFound = errors.New("user not found")
)

type User interface {
	Create(ctx context.Context, user *UserDTO) error
	Read(ctx context.Context, id int64) (*UserDTO, error)

	ReadByTeam(ctx context.Context, teamId int64) ([]*UserDTO, error)
	ReadByHack(ctx context.Context, hackathonId int64) ([]*UserDTO, error)

	Update(ctx context.Context, user *UserDTO) error
	Delete(ctx context.Context, id int64) error
}

type UserDTO struct {
	ID        int64
	FirstName string
	LastName  string
	PhotoURL  string
	Bio       string
	Skills    []string
	TeamId    int64
}

type Skills struct {
	ID   int64
	Name string
}
