package postgres

import (
	"context"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/huandu/go-sqlbuilder"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ repo.Hackathon = (*HackRepo)(nil)

type HackRepo struct {
	pool *pgxpool.Pool
}

func (h *HackRepo) List(ctx context.Context) ([]*repo.HackathonGeneralDTO, error) {
	sb := sqlbuilder.NewSelectBuilder()

	// Выбираем все поля из таблицы hackathon
	sb.Select(
		"id",
		"admin_id",
		"name",
		"description",
		"start_date",
		"end_date",
		"max_teams",
		"max_team_size",
	).
		From("hackmate.hackathon").
		OrderByDesc("start_date")

	sql, args := sb.Build()

	rows, err := h.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query hackathons: %w", err)
	}
	defer rows.Close()

	var hackathons []*repo.HackathonGeneralDTO
	for rows.Next() {
		var hackathon repo.HackathonGeneralDTO

		err := rows.Scan(
			&hackathon.Id,
			&hackathon.AdminId,
			&hackathon.Name,
			&hackathon.Desc,
			&hackathon.StartDate,
			&hackathon.EndDate,
			&hackathon.MaxTeams,
			&hackathon.MaxTeamSize,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan hackathon: %w", err)
		}

		hackathons = append(hackathons, &hackathon)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating hackathons rows: %w", err)
	}

	return hackathons, nil
}

func (h *HackRepo) Read(ctx context.Context, id int64) (*repo.HackathonDTO, error) {
	//TODO implement me
	panic("implement me")
}
