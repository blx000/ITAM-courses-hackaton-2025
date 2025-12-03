package repo

import (
	"context"
	"time"
)

type Hackathon interface {
	List(ctx context.Context) ([]*HackathonDTO, error)
}

type HackathonDTO struct {
	Id            int64
	AdminId       int64
	Name          string
	Desc          string
	Start_date    time.Time
	End_date      time.Time
	max_teams     int64
	max_team_size int64
	Teams         []*Team
	Users         []*User
}
