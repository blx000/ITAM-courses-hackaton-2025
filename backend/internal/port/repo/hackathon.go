package repo

import (
	"context"
	"time"
)

// список хакатонов
// список участников хака
// список команд хака

type Hackathon interface {
	List(ctx context.Context) ([]*HackathonGeneralDTO, error)
	Read(ctx context.Context, id int64) (*HackathonDTO, error)
}

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
