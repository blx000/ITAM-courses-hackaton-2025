package repo

import (
	"context"
	"errors"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
)

type User interface {
	Create(ctx context.Context, user *UserDTO) error
	Read(ctx context.Context, id int64) (*UserDTO, error)
	ReadAdmin(ctx context.Context, login string) (*UserDTO, error)

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
	IsAdmin   bool
	Login     string
	PassHash  string
}

type Skill struct {
	ID   int
	Name string
}

type Role struct {
	ID   int
	Name string
}
