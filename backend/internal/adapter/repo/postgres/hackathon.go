package postgres

import (
	"context"
	"errors"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/huandu/go-sqlbuilder"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ repo.Hackathon = (*HackRepo)(nil)

type HackRepo struct {
	pool *pgxpool.Pool
}

func (h *HackRepo) CreateTeam(ctx context.Context, participantId int, hackId int, name string) error {
	const defaultMaxSize = 5

	// Начнем транзакцию
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	sb := sqlbuilder.PostgreSQL.NewInsertBuilder()
	insertTeamQuery, insertTeamArgs := sb.InsertInto("hackmate.team").
		Cols("name", "captain_id", "hackathon_id", "max_size").
		Values(name, participantId, hackId, defaultMaxSize).
		SQL("RETURNING id").
		Build()

	var teamId int
	err = tx.QueryRow(ctx, insertTeamQuery, insertTeamArgs...).Scan(&teamId)
	if err != nil {
		return fmt.Errorf("failed to create team: %w", err)
	}

	sb2 := sqlbuilder.PostgreSQL.NewInsertBuilder()
	insertParticipantQuery, insertParticipantArgs := sb2.InsertInto("hackmate.team_participant").
		Cols("participant_id", "team_id").
		Values(participantId, teamId).
		Build()

	_, err = tx.Exec(ctx, insertParticipantQuery, insertParticipantArgs...)
	if err != nil {
		return fmt.Errorf("failed to add captain to team: %w", err)
	}

	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (h *HackRepo) ListParticipants(ctx context.Context, hackId int) ([]*repo.Participant, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	sb.Select("p.id", "u.first_name", "u.last_name", "p.experience", "p.additional_info", "COALESCE(tp.team_id, -1) as team_id, r.id, r.name").
		From("hackmate.participant p").
		Where(sb.Equal("p.hack_id", hackId)).
		Join("hackmate.user u", "u.id = p.user_id").
		Join("hackmate.role r", "r.id = p.role_id").
		JoinWithOption(sqlbuilder.LeftJoin, "hackmate.team_participant tp", "tp.participant_id = p.id")

	sql, args := sb.Build()

	rows, err := h.pool.Query(ctx, sql, args...)
	defer rows.Close()
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, repo.ErrHackathonNotFound
		}
		return nil, err
	}
	participants := make([]*repo.Participant, 0)
	var (
		roleId   int
		roleName string
	)
	for rows.Next() {
		var participant repo.Participant
		err := rows.Scan(&participant.Id,
			&participant.FirstName,
			&participant.LastName,
			&participant.Experience,
			&participant.AddInfo,
			&participant.TeamId,
			&roleId,
			&roleName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan hackathon: %w", err)
		}

		participant.Role = repo.Role{
			ID:   roleId,
			Name: roleName,
		}

		participants = append(participants, &participant)
		fmt.Println(participant)
	}

	if err = rows.Err(); err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("error iterating hackathons rows: %w", err)
	}

	return participants, nil
}

func (h *HackRepo) ListTeams(ctx context.Context, hackId int) ([]*repo.TeamShort, error) {
	//TODO implement me
	panic("implement me")
}

func NewHackRepo(pool *pgxpool.Pool) *HackRepo {
	return &HackRepo{
		pool: pool,
	}
}

func (h *HackRepo) AddParticipant(ctx context.Context, hackId int, create repo.FormCreate) error {
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer func() {
		if err != nil {
			tx.Rollback(ctx)
		}
	}()

	var participantId int64
	ib := sqlbuilder.PostgreSQL.NewInsertBuilder()

	ib.InsertInto("hackmate.participant").
		Cols("user_id", "role_id", "hack_id", "experience", "additional_info").
		Values(create.UserId, create.Role.ID, hackId, create.Experience, create.AddInfo).
		Returning("id")

	sql, args := ib.Build()

	err = tx.QueryRow(ctx, sql, args...).Scan(&participantId)
	if err != nil {
		return fmt.Errorf("failed to insert participant: %w", err)
	}

	if len(create.SKills) > 0 {
		err = h.insertParticipantSkills(ctx, tx, participantId, create.SKills)
		if err != nil {
			return fmt.Errorf("failed to insert participant skills: %w", err)
		}
	}

	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (h *HackRepo) insertParticipantSkills(ctx context.Context, tx pgx.Tx, participantId int64, skills []repo.Skill) error {
	if len(skills) == 0 {
		return nil
	}

	ib := sqlbuilder.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("hackmate.participant_skill").
		Cols("participant_id", "skill_id")

	for _, skill := range skills {
		ib.Values(participantId, skill.ID)
	}

	ib.SQL("ON CONFLICT (participant_id, skill_id) DO NOTHING")

	sql, args := ib.Build()

	_, err := tx.Exec(ctx, sql, args...)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to insert participant skills: %w", err)
	}

	return nil
}

func (h *HackRepo) GetParticipant(ctx context.Context, hackId int, userId int64) (*repo.Participant, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	sb.Select(
		"p.id",
		"u.first_name",
		"u.last_name",
		"r.id as role_id",
		"r.name as role_name",
		"COALESCE(tp.team_id, -1) as team_id", // -1 если нет команды
	).
		From("hackmate.participant as p").
		Join("hackmate.user as u", "p.user_id = u.id").
		Join("hackmate.role as r", "p.role_id = r.id").
		JoinWithOption(sqlbuilder.LeftJoin, "hackmate.team_participant as tp", "p.id = tp.participant_id").
		Where(sb.Equal("p.user_id", userId)).
		Where(sb.Equal("p.hack_id", hackId))

	sql, args := sb.Build()

	var participant repo.Participant
	var roleId int
	var roleName string

	err := h.pool.QueryRow(ctx, sql, args...).Scan(
		&participant.Id,
		&participant.FirstName,
		&participant.LastName,
		&roleId,
		&roleName,
		&participant.TeamId,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, repo.ErrParticipantNotFound
		}
		return nil, fmt.Errorf("failed to get participant: %w", err)
	}

	// Заполняем роль
	participant.Role = repo.Role{
		ID:   roleId,
		Name: roleName,
	}

	// Получаем навыки участника
	skills, err := h.getParticipantSkills(ctx, participant.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get participant skills: %w", err)
	}
	participant.Skills = skills

	return &participant, nil
}

func (h *HackRepo) getParticipantSkills(ctx context.Context, participantId int) ([]repo.Skill, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	sb.Select("s.id", "s.name").
		From("hackmate.participant_skill as ps").
		Join("hackmate.skill as s", "ps.skill_id = s.id").
		Where(sb.Equal("ps.participant_id", participantId))

	sql, args := sb.Build()

	rows, err := h.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query participant skills: %w", err)
	}
	defer rows.Close()

	var skills []repo.Skill
	for rows.Next() {
		var skill repo.Skill
		if err := rows.Scan(&skill.ID, &skill.Name); err != nil {
			return nil, fmt.Errorf("failed to scan skill: %w", err)
		}
		skills = append(skills, skill)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating skills rows: %w", err)
	}

	return skills, nil
}

func (h *HackRepo) Read(ctx context.Context, hackId int) (*repo.HackathonGeneralDTO, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

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
		Where(sb.Equal("id", hackId))

	sql, args := sb.Build()

	var hackathon repo.HackathonGeneralDTO

	err := h.pool.QueryRow(ctx, sql, args...).Scan(
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
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, repo.ErrHackathonNotFound
		}
		return nil, fmt.Errorf("failed to get hackathon by id %d: %w", hackId, err)
	}

	return &hackathon, nil
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
	defer rows.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to query hackathons: %w", err)
	}

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
		fmt.Println(hackathon)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating hackathons rows: %w", err)
	}

	return hackathons, nil
}
