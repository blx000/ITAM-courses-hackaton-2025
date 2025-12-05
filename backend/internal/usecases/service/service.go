package service

import (
	"context"
	"errors"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
)

var (
	ErrHackNotFound = errors.New("hack not found")
)

type Service interface {
	LoginUser(ctx context.Context, code string) (string, string, error)
	LoginAdmin(ctx context.Context, login string, password string) (string, string, error)

	ListSkills(ctx context.Context) ([]*repo.Skill, error)
	ListRoles(ctx context.Context) ([]*repo.Role, error)

	ListHacks(ctx context.Context) ([]*repo.HackathonGeneralDTO, error)
	GetHack(ctx context.Context, hackId int) (*repo.HackathonGeneralDTO, error)
	EnterHackathon(ctx context.Context, create repo.FormCreate) error
	ListParticipants(ctx context.Context, hackId int) ([]*repo.Participant, error)
	ListHackTeams(ctx context.Context, hackId int) ([]*repo.TeamShort, error)
	GetTeam(ctx context.Context, teamId int) (*repo.TeamShort, error)
}
