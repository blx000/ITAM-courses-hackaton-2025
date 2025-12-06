package repo

import (
	"context"
	"errors"
	"time"
)

// список хакатонов
// список участников хака
// список команд хака

type Hackathon interface {
	List(ctx context.Context) ([]*HackathonGeneralDTO, error)
	Read(ctx context.Context, id int) (*HackathonGeneralDTO, error)
	AddParticipant(ctx context.Context, hackId int, create FormCreate) error
	GetParticipant(ctx context.Context, hackId int, userId int64) (*Participant, error)
	ListParticipants(ctx context.Context, hackId int) ([]*Participant, error)
	ListTeams(ctx context.Context, hackId int) ([]*TeamShort, error)
	CreateTeam(ctx context.Context, participantId int, hackId int, name string) error
	GetTeamProfile(ctx context.Context, teamId int) (*TeamShort, error)
	GetParticipantProfile(ctx context.Context, participantId int) (*Participant, error)
	CreateHack(ctx context.Context, dto *HackathonGeneralDTO) (int, error)
	GetParticipantGeneral(ctx context.Context, participantId int) (*Participant, error)

	CreateInvite(ctx context.Context, teamId int, recId int) error
	GetInvite(ctx context.Context, inviteId int) (*Invitation, error)
	AcceptInvite(ctx context.Context, inviteId int, teamId int, participantId int) error
}

var (
	ErrHackathonNotFound   = errors.New("Hackathon Not Found")
	ErrParticipantNotFound = errors.New("Participant Not Found")
)

type HackathonDTO struct {
	Id          int
	AdminId     int64
	Name        string
	Desc        string
	StartDate   time.Time
	EndDate     time.Time
	MaxTeams    int
	MaxTeamSize int
	Teams       []*Team
	Users       []*User
}

type HackathonGeneralDTO struct {
	Id          int
	AdminId     int64
	Name        string
	Desc        string
	Prize       int
	StartDate   time.Time
	EndDate     time.Time
	MaxTeams    int
	MaxTeamSize int
}
