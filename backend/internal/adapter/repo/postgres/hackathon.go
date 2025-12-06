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

func (h *HackRepo) GetParticipantProfile(ctx context.Context, participantId int) (*repo.Participant, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	participantQuery, participantArgs := sb.Select(
		"p.id",
		"u.first_name",
		"u.last_name",
		"r.id as role_id",
		"r.name as role_name",
		"p.experience",
		"p.additional_info",
		"p.hack_id",
		"COALESCE(tp.team_id, -1) as team_id",
	).
		From("hackmate.participant p").
		Join("hackmate.user u", "p.user_id = u.id").
		Join("hackmate.role r", "p.role_id = r.id").
		JoinWithOption(sqlbuilder.LeftJoin,
			"hackmate.team_participant tp",
			"p.id = tp.participant_id").
		Where(sb.Equal("p.id", participantId)).
		Build()

	var participant repo.Participant

	err := h.pool.QueryRow(ctx, participantQuery, participantArgs...).Scan(
		&participant.Id,
		&participant.FirstName,
		&participant.LastName,
		&participant.Role.ID,
		&participant.Role.Name,
		&participant.Experience,
		&participant.AddInfo,
		&participant.HackId,
		&participant.TeamId,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("participant not found")
		}
		return nil, fmt.Errorf("failed to get participant: %w", err)
	}

	// 2. Получаем навыки участника
	sb2 := sqlbuilder.PostgreSQL.NewSelectBuilder()

	skillsQuery, skillsArgs := sb2.Select(
		"s.id",
		"s.name",
	).
		From("hackmate.skill s").
		Join("hackmate.participant_skill ps", "s.id = ps.skill_id").
		Where(sb2.Equal("ps.participant_id", participantId)).
		Build()

	rows, err := h.pool.Query(ctx, skillsQuery, skillsArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query participant skills: %w", err)
	}
	defer rows.Close()

	var skills []repo.Skill

	for rows.Next() {
		var skill repo.Skill

		err := rows.Scan(
			&skill.ID,
			&skill.Name,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan skill: %w", err)
		}

		skills = append(skills, skill)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	participant.Skills = skills

	return &participant, nil
}

func (h *HackRepo) GetTeamProfile(ctx context.Context, teamId int) (*repo.TeamShort, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	teamQuery, teamArgs := sb.Select(
		"t.id",
		"t.name",
		"t.captain_id",
		"t.hackathon_id",
	).
		From("hackmate.team t").
		Where(sb.Equal("t.id", teamId)).
		Build()

	var team repo.TeamShort

	err := h.pool.QueryRow(ctx, teamQuery, teamArgs...).Scan(
		&team.ID,
		&team.Name,
		&team.CaptainId,
		&team.HackId,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("team not found")
		}
		return nil, fmt.Errorf("failed to get team: %w", err)
	}

	sb2 := sqlbuilder.PostgreSQL.NewSelectBuilder()

	membersQuery, membersArgs := sb2.Select(
		"p.id",
		"u.first_name",
		"u.last_name",
		"r.id as role_id",
		"r.name as role_name",
		"p.experience",
		"p.additional_info",
		"p.hack_id",
	).
		From("hackmate.participant p").
		Join("hackmate.user u", "p.user_id = u.id").
		Join("hackmate.role r", "p.role_id = r.id").
		Join("hackmate.team_participant tp", "p.id = tp.participant_id").
		Where(sb2.Equal("tp.team_id", teamId)).
		Build()

	rows, err := h.pool.Query(ctx, membersQuery, membersArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query team members: %w", err)
	}
	defer rows.Close()

	var members []*repo.Participant

	for rows.Next() {
		var member repo.Participant
		var roleID int
		var roleName string

		err := rows.Scan(
			&member.Id,
			&member.FirstName,
			&member.LastName,
			&roleID,
			&roleName,
			&member.Experience,
			&member.AddInfo,
			&member.TeamId,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan member: %w", err)
		}

		member.Role = repo.Role{
			ID:   roleID,
			Name: roleName,
		}

		member.Skills = []repo.Skill{}

		members = append(members, &member)
	}

	if err = rows.Err(); err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	team.Members = members

	return &team, nil
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
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	query, args := sb.Select(
		"t.id",
		"t.name",
		"t.captain_id",
		"t.hackathon_id",
		"COUNT(tp.participant_id) as member_cnt",
	).
		From("hackmate.team t").
		JoinWithOption(sqlbuilder.LeftJoin,
			"hackmate.team_participant tp",
			"t.id = tp.team_id").
		Where(sb.Equal("t.hackathon_id", hackId)).
		GroupBy("t.id").
		OrderByAsc("t.id").
		Build()

	rows, err := h.pool.Query(ctx, query, args...)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to query teams: %w", err)
	}
	defer rows.Close()

	var teams []*repo.TeamShort

	for rows.Next() {
		var team repo.TeamShort

		err := rows.Scan(
			&team.ID,
			&team.Name,
			&team.CaptainId,
			&team.HackId,
			&team.MemberCnt,
		)
		if err != nil {
			fmt.Println(err)
			return nil, fmt.Errorf("failed to scan team: %w", err)
		}

		team.Members = []*repo.Participant{}

		teams = append(teams, &team)
	}

	if err = rows.Err(); err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return teams, nil
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
