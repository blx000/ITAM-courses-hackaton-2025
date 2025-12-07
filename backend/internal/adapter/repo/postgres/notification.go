package postgres

import (
	"context"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/huandu/go-sqlbuilder"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ repo.Notification = (*NotificationRepo)(nil)

type NotificationRepo struct {
	pgPool *pgxpool.Pool
}

func (n *NotificationRepo) Create(ctx context.Context, message string, participantId int) error {
	sb := sqlbuilder.PostgreSQL.NewInsertBuilder()

	query, args := sb.InsertInto("hackmate.notifications").
		Cols("message", "participant_id").
		Values(message, participantId).
		Build()

	_, err := n.pgPool.Exec(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}

	return nil
}

func (n *NotificationRepo) ReadBatch(ctx context.Context, batchSize int) ([]*repo.NotificationDto, error) {
	// Начинаем транзакцию
	tx, err := n.pgPool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Получаем уведомления с chat_id
	sb := sqlbuilder.PostgreSQL.NewSelectBuilder()

	query, args := sb.Select(
		"n.id",
		"n.message",
		"u.chat_id",
	).
		From("hackmate.notifications n").
		Join("hackmate.participant p", "n.participant_id = p.id").
		Join("hackmate.user u", "p.user_id = u.id").
		OrderByAsc("n.id").
		Limit(batchSize).
		Build()

	rows, err := tx.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query notifications: %w", err)
	}
	defer rows.Close()

	var notifications []*repo.NotificationDto
	var notificationIDs []int

	for rows.Next() {
		var notification repo.NotificationDto

		err := rows.Scan(
			&notification.ID,
			&notification.Message,
			&notification.ChatId,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan notification: %w", err)
		}

		notifications = append(notifications, &notification)
		notificationIDs = append(notificationIDs, notification.ID)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	// Если нет уведомлений, возвращаем пустой список
	if len(notifications) == 0 {
		return notifications, nil
	}

	sb2 := sqlbuilder.PostgreSQL.NewDeleteBuilder()

	interfaceIDs := make([]interface{}, len(notificationIDs))
	for i, id := range notificationIDs {
		interfaceIDs[i] = id
	}

	deleteQuery, deleteArgs := sb2.DeleteFrom("hackmate.notifications").
		Where(sb2.In("id", interfaceIDs...)).
		Build()

	_, err = tx.Exec(ctx, deleteQuery, deleteArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to delete notifications: %w", err)
	}

	// Фиксируем транзакцию
	if err = tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return notifications, nil
}

func NewNotificationRepo(pgPool *pgxpool.Pool) *NotificationRepo {
	return &NotificationRepo{
		pgPool: pgPool,
	}
}
