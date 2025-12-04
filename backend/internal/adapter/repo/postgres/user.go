package postgres

import (
	"context"
	"errors"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/huandu/go-sqlbuilder"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"strings"
)

var _ repo.User = (*UserRepo)(nil)

type UserRepo struct {
	pool *pgxpool.Pool
}

func (u *UserRepo) Create(ctx context.Context, user *repo.UserDTO) error {
	ib := sqlbuilder.PostgreSQL.NewInsertBuilder()

	ib.InsertInto("hackmate.user").
		Cols("id", "first_name", "last_name").
		Values(user.ID, user.FirstName, user.LastName)

	sql, args := ib.Build()

	_, err := u.pool.Exec(ctx, sql, args...)
	if err != nil {
		errStr := err.Error()
		if strings.Contains(errStr, "duplicate key") ||
			strings.Contains(errStr, "23505") {
			return repo.ErrUserAlreadyExists
		}
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
	return &UserRepo{
		pool: pool,
	}
}

func (u *UserRepo) Read(ctx context.Context, id int64) (*repo.UserDTO, error) {
	//TODO implement me
	sb := sqlbuilder.NewSelectBuilder()

	sb.Select("first_name", "last_name", "photo_url", "bio").
		From("hackmate.user u").Where(sb.Equal("hackmate.id", id))

	sql, args := sb.Build()

	var (
		firstName string
		lastName  string
		photoURL  string
		bio       string
		skills    []string
	)

	err := u.pool.
		QueryRow(ctx, sql, args...).
		Scan(
			&firstName,
			&lastName,
			&photoURL,
			&bio,
		)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, repo.ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to read user %w", err)
	}

	sb.Select("name").
		From("hackmate.user_skill as us").
		Where(sb.Equal("us.user_id", id)).
		Join("hackmate.skill as s", "us.skill_id = s.id")

	sql, args = sb.Build()

	rows, err := u.pool.Query(ctx, sql, args...)
	defer rows.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to read user %w", err)
	}

	for rows.Next() {
		var skillName string
		if err := rows.Scan(&skillName); err != nil {
			return nil, fmt.Errorf("failed to scan skill: %w", err)
		}
		skills = append(skills, skillName)
	}

	return &repo.UserDTO{
		ID:        id,
		FirstName: firstName,
		LastName:  lastName,
		PhotoURL:  photoURL,
		Bio:       bio,
		Skills:    skills,
	}, nil
}

func (u *UserRepo) ReadByTeam(ctx context.Context, teamId int64) ([]*repo.UserDTO, error) {
	sb := sqlbuilder.NewSelectBuilder()

	sb.Select(
		"u.id",
		"u.first_name",
		"u.last_name",
		"u.photo_url",
		"u.bio",
		"f.experience",
		"f.additional_info",
		"COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles",
	).
		From("hackmate.team_form as tf").
		Join("hackmate.form as f", "tf.form_id = f.id").
		Join("hackmate.user as u", "f.user_id = u.id").
		JoinWithOption(sqlbuilder.LeftJoin, "hackmate.form_role as fr", "f.id = fr.form_id").
		JoinWithOption(sqlbuilder.LeftJoin, "hackmate.role as r", "fr.role_id = r.id").
		Where(sb.Equal("tf.team_id", teamId)).
		GroupBy("u.id", "u.first_name", "u.last_name", "u.photo_url", "u.bio",
			"f.experience", "f.additional_info")

	sql, args := sb.Build()

	rows, err := u.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query team members: %w", err)
	}
	defer rows.Close()

	var users []*repo.UserDTO
	for rows.Next() {
		var user repo.UserDTO
		var roles []string
		var experience int
		var additionalInfo string

		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&user.PhotoURL,
			&user.Bio,
			&experience,
			&additionalInfo,
			&roles,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}

		user.Skills = roles
		user.TeamId = teamId // Устанавливаем ID команды
		users = append(users, &user)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating team members rows: %w", err)
	}

	return users, nil
}

func (u *UserRepo) ReadByHack(ctx context.Context, hackathonId int64) ([]*repo.UserDTO, error) {
	sb := sqlbuilder.NewSelectBuilder()

	sb.Select(
		"u.id",
		"u.first_name",
		"u.last_name",
		"u.photo",
		"u.bio",
		"COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles",
		"COALESCE(tf.team_id, 0) as team_id",
		"f.experience",
		"f.additional_info",
	).
		From("hackmate.form as f").
		Join("hackmate.user as u", "f.user_id = u.id").
		JoinWithOption(sqlbuilder.LeftJoin, "hackmate.form_role as fr", "f.id = fr.form_id").
		JoinWithOption(sqlbuilder.LeftJoin, "hackmate.role as r", "fr.role_id = r.id").
		JoinWithOption(sqlbuilder.LeftJoin, "hackmate.team_form as tf", "f.id = tf.form_id").
		Where(sb.Equal("f.hack_id", hackathonId)).
		GroupBy("u.id", "u.first_name", "u.last_name", "u.photo_url", "u.bio",
			"tf.team_id", "f.experience", "f.additional_info") // Сначала без команды

	sql, args := sb.Build()

	rows, err := u.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query hackathon participants: %w", err)
	}
	defer rows.Close()

	var users []*repo.UserDTO
	for rows.Next() {
		var user repo.UserDTO
		var roles []string
		var experience int
		var additionalInfo string
		var teamID int64 // Используем NullInt64 для nullable поля

		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&user.PhotoURL,
			&user.Bio,
			&roles,
			&teamID,
			&experience,
			&additionalInfo,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}

		user.Skills = roles
		user.TeamId = teamID

		users = append(users, &user)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating participants rows: %w", err)
	}

	return users, nil
}

func (u *UserRepo) Update(ctx context.Context, user *repo.UserDTO) error {
	//TODO implement me
	panic("implement me")
}

func (u *UserRepo) Delete(ctx context.Context, id int64) error {
	//TODO implement me
	panic("implement me")
}
