package postgres

import (
	"context"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/huandu/go-sqlbuilder"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ repo.Team = (*TeamRepo)(nil)

type TeamRepo struct {
	pool *pgxpool.Pool
}

func (t *TeamRepo) AddMember(ctx context.Context, teamId int, formId int64) error {
	ib := sqlbuilder.NewInsertBuilder()

	ib.InsertInto("hackmate.team_form").
		Cols("team_id", "form_id").
		Values(teamId, formId)

	sql, args := ib.Build()

	_, err := t.pool.Exec(ctx, sql, args...)
	if err != nil {

		return fmt.Errorf("failed to add member to team: %w", err)
	}

	return nil
}

func (t TeamRepo) Create(ctx context.Context, name string, captainId int64, hackId int64) error {
	//TODO implement me
	panic("implement me")
}

func (t *TeamRepo) DeleteMember(ctx context.Context, teamID int, memberID int64) error {
	db := sqlbuilder.NewDeleteBuilder()

	db.DeleteFrom("hackmate.team_user").
		Where(db.Equal("team_id", teamID)).
		Where(db.Equal("user_id", memberID))

	sql, args := db.Build()

	_, err := t.pool.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete team member: %w", err)
	}
	return nil
}

func (t TeamRepo) Update(ctx context.Context, name string, captainId int64, hackId int64) error {
	//TODO implement me
	panic("implement me")
}

func (t *TeamRepo) ReadByHackId(ctx context.Context, hackId int64) ([]*repo.TeamDTO, error) {
	sb := sqlbuilder.NewSelectBuilder()

	sb.Select(
		"t.id",
		"t.captain_id",
		"t.hackathon_id",
		"t.name",
		"COUNT(DISTINCT tf.form_id) as member_count", // Считаем по form_id вместо user_id
	).
		From("hackmate.team as t").
		JoinWithOption(sqlbuilder.LeftJoin, "hackmate.team_form as tf", "t.id = tf.team_id").
		Where(sb.Equal("t.hackathon_id", hackId)).
		GroupBy("t.id", "t.captain_id", "t.hackathon_id", "t.name")

	sql, args := sb.Build()

	rows, err := t.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query teams: %w", err)
	}
	defer rows.Close()

	var teams []*repo.TeamDTO
	for rows.Next() {
		var team repo.TeamDTO
		var memberCount int64

		err := rows.Scan(
			&team.ID,
			&team.CaptainId,
			&team.HackId,
			&team.Name,
			&memberCount,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan team: %w", err)
		}

		// Members остается пустым массивом, так как запрашиваем только общую информацию
		team.Members = []*repo.UserDTO{}
		teams = append(teams, &team)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating teams rows: %w", err)
	}

	return teams, nil
}
