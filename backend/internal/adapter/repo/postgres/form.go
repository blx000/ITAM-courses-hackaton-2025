package postgres

import (
	"context"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/huandu/go-sqlbuilder"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"strings"
)

var _ repo.Form = (*FormRepo)(nil)

type FormRepo struct {
	pool *pgxpool.Pool
}

func NewFormRepo(pool *pgxpool.Pool) *FormRepo {
	return &FormRepo{pool: pool}
}

func (f *FormRepo) ListSkills(ctx context.Context) ([]*repo.Skill, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	sb.Select("id", "name").
		From("hackmate.skill")

	sql, args := sb.Build()

	rows, err := f.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query skills: %w", err)
	}
	defer rows.Close()

	var skills []*repo.Skill
	for rows.Next() {
		var skill repo.Skill
		if err := rows.Scan(&skill.ID, &skill.Name); err != nil {
			return nil, fmt.Errorf("failed to scan skill: %w", err)
		}
		skills = append(skills, &skill)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating skills rows: %w", err)
	}

	return skills, nil
}

func (f *FormRepo) ListRoles(ctx context.Context) ([]*repo.Role, error) {
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	sb.Select("id", "name").
		From("hackmate.role")

	sql, args := sb.Build()

	rows, err := f.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query roles: %w", err)
	}
	defer rows.Close()

	var roles []*repo.Role
	for rows.Next() {
		var role repo.Role
		if err := rows.Scan(&role.ID, &role.Name); err != nil {
			return nil, fmt.Errorf("failed to scan role: %w", err)
		}
		roles = append(roles, &role)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating roles rows: %w", err)
	}

	return roles, nil
}

func (f *FormRepo) GetForm(ctx context.Context, userId int64) (*repo.FormDto, error) {
	//TODO implement me
	panic("implement me")
}

func (f *FormRepo) Create(ctx context.Context, userId int64, hackId int, exp int, addInfo string, roleIds []int, skillIds []int) error {
	// Начинаем транзакцию, так как нужно вставить в несколько таблиц
	tx, err := f.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Откатываем транзакцию в случае ошибки
	defer func() {
		if err != nil {
			tx.Rollback(ctx)
		}
	}()

	// 1. Создаем основную запись формы
	ib := sqlbuilder.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("hackmate.form").
		Cols("user_id", "hack_id", "experience", "additional_info").
		Values(userId, hackId, exp, addInfo).
		Returning("id")

	sql, args := ib.Build()

	var formId int64
	err = tx.QueryRow(ctx, sql, args...).Scan(&formId)
	if err != nil {
		// Проверяем на нарушение уникальности (один пользователь - одна форма на хакатон)
		errStr := err.Error()
		if strings.Contains(errStr, "unique constraint") ||
			strings.Contains(errStr, "23505") {
			return repo.ErrFormAlreadyExists
		}
		// Проверяем нарушение foreign key
		if strings.Contains(errStr, "foreign key") ||
			strings.Contains(errStr, "23503") {
			return repo.ErrForeignKeyViolation
		}
		return fmt.Errorf("failed to create form: %w", err)
	}

	// 2. Добавляем роли, если они указаны
	if len(roleIds) > 0 {
		err = f.insertFormRoles(ctx, tx, formId, roleIds)
		if err != nil {
			return fmt.Errorf("failed to insert form roles: %w", err)
		}
	}

	// 3. Добавляем навыки, если они указаны
	if len(skillIds) > 0 {
		err = f.insertFormSkills(ctx, tx, formId, skillIds)
		if err != nil {
			return fmt.Errorf("failed to insert form skills: %w", err)
		}
	}

	// Коммитим транзакцию
	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// Вспомогательная функция для добавления ролей
func (f *FormRepo) insertFormRoles(ctx context.Context, tx pgx.Tx, formId int64, roleIds []int) error {
	if len(roleIds) == 0 {
		return nil
	}

	// Используем batch insert для эффективной вставки
	ib := sqlbuilder.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("hackmate.form_role").
		Cols("form_id", "role_id")

	for _, roleId := range roleIds {
		ib.Values(formId, roleId)
	}

	// Добавляем ON CONFLICT для игнорирования дубликатов
	ib.SQL("ON CONFLICT (form_id, role_id) DO NOTHING")

	sql, args := ib.Build()

	_, err := tx.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to insert form roles: %w", err)
	}

	return nil
}

// Вспомогательная функция для добавления навыков
func (f *FormRepo) insertFormSkills(ctx context.Context, tx pgx.Tx, formId int64, skillIds []int) error {
	if len(skillIds) == 0 {
		return nil
	}

	ib := sqlbuilder.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("hackmate.form_skill").
		Cols("form_id", "skill_id")

	for _, skillId := range skillIds {
		ib.Values(formId, skillId)
	}

	ib.SQL("ON CONFLICT (form_id, skill_id) DO NOTHING")

	sql, args := ib.Build()

	_, err := tx.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to insert form skills: %w", err)
	}

	return nil
}
