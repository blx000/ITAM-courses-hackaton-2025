package repo

import "context"

type Notification interface {
	Create(ctx context.Context, message string, participantId int) error
	ReadBatch(ctx context.Context, batchSize int) ([]*NotificationDto, error)
}

type NotificationDto struct {
	ID      int
	Message string
	ChatId  int64
}
