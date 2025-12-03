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

var _ repo.User = (*UserRepo)(nil)

type UserRepo struct {
	pool *pgxpool.Pool
}

func (u *UserRepo) Create(ctx context.Context, user *repo.UserDTO) error {
	//TODO implement me
	panic("implement me")
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
	//TODO implement me
	panic("implement me")
}

func (u *UserRepo) ReadByHack(ctx context.Context, hackathonId int64) ([]*repo.UserDTO, error) {
	//TODO implement me
	panic("implement me")
}

func (u *UserRepo) Update(ctx context.Context, user *repo.UserDTO) error {
	//TODO implement me
	panic("implement me")
}

func (u *UserRepo) Delete(ctx context.Context, id int64) error {
	//TODO implement me
	panic("implement me")
}
