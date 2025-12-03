package postgres

import (
	"context"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ repo.Team = (*TeamRepo)(nil)

type TeamRepo struct {
	pool *pgxpool.Pool
}

func (t TeamRepo) AddMember(ctx context.Context, id int64, memberId int64) error {
	//TODO implement me
	panic("implement me")
}

func (t TeamRepo) Create(ctx context.Context, name string, captainId int64, hackId int64) error {
	//TODO implement me
	panic("implement me")
}

func (t TeamRepo) DeleteMember(ctx context.Context, id int64, memberId int64) error {
	//TODO implement me
	panic("implement me")
}

func (t TeamRepo) Update(ctx context.Context, name string, captainId int64, hackId int64) error {
	//TODO implement me
	panic("implement me")
}

func (t TeamRepo) ReadByHackId(ctx context.Context, hackId int64) ([]*repo.TeamDTO, error) {
	//TODO implement me
	panic("implement me")
}

func (t TeamRepo) ReadByUserId(ctx context.Context, userId int64) ([]*repo.TeamDTO, error) {
	//TODO implement me
	panic("implement me")
}
