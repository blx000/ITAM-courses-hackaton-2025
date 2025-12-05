package repo

import (
	"errors"
	"golang.org/x/net/context"
)

type Form interface {
	Create(ctx context.Context, userId int64, hackId int, exp int, addInfo string, roleIds []int, skillIds []int) error
	GetForm(ctx context.Context, userId int64) (*FormDto, error)
	ListSkills(ctx context.Context) ([]*Skill, error)
	ListRoles(ctx context.Context) ([]*Role, error)
}

var (
	ErrForeignKeyViolation = errors.New("No hack found")
	ErrFormAlreadyExists   = errors.New("Form already exists")
)

type FormDto struct {
	Id         int
	UserId     int64
	TeamId     int
	Experience int
	AddInfo    string
}

type Participant struct {
	Id        int
	FirstName string
	LastName  string
	Skills    []Skill
	Role      Role
	TeamId    int
}

type FormCreate struct {
	ID         int
	UserId     int64
	HackId     int
	Experience int
	AddInfo    string
	SKills     []Skill
	Role       Role
}
