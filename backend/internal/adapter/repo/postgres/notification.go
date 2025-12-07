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

	rows, err := n.pgPool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query notifications: %w", err)
	}
	defer rows.Close()

	var notifications []*repo.NotificationDto

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
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return notifications, nil
}

func NewNotificationRepo(pgPool *pgxpool.Pool) *NotificationRepo {
	return &NotificationRepo{
		pgPool: pgPool,
	}
}
