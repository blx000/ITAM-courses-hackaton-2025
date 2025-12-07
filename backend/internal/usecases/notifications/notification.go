package notifications

import (
	"context"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"sync"
	"time"
)

const (
	batchSize = 30
)

type NotificationCase struct {
	bot              *tgbotapi.BotAPI
	notificationRepo repo.Notification
	wg               *sync.WaitGroup
}

func NewNotificationCase(bot *tgbotapi.BotAPI, nRepo repo.Notification) *NotificationCase {
	return &NotificationCase{
		bot:              bot,
		notificationRepo: nRepo,
		wg:               &sync.WaitGroup{},
	}
}

func (n *NotificationCase) Start(ctx context.Context) {
	ticker := time.NewTicker(20 * time.Second)
	for {
		select {
		case <-ticker.C:
			ntfs, err := n.notificationRepo.ReadBatch(ctx, batchSize)
			if err != nil {
				fmt.Println(err)
				continue
			}
			n.wg.Add(len(ntfs))
			for _, ntf := range ntfs {
				go func() {
					defer n.wg.Done()
					fmt.Println(ntf.ChatId)
					msg := tgbotapi.NewMessage(ntf.ChatId, ntf.Message)
					msg.ParseMode = "Markdown"
					_, errSend := n.bot.Send(msg)
					if errSend != nil {
						fmt.Println(errSend)
					}
				}()
			}
			n.wg.Wait()
		case <-ctx.Done():
			return
		}
	}
}
