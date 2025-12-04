package bot

import (
	"context"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/config"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"log"
	"time"
)

type TgBot struct {
	bot      *tgbotapi.BotAPI
	authRepo repo.Auth
	timeout  int
}

func NewTgBot(cfg config.TGBotConfig, repos repo.Auth) *TgBot {
	bot, err := tgbotapi.NewBotAPI(cfg.Token)
	if err != nil {
		fmt.Printf("token not found: %s\n", cfg.Token)
		log.Panic(err)
	}

	bot.Debug = true

	log.Printf("Authorized on account %s", bot.Self.UserName)

	return &TgBot{
		bot:      bot,
		authRepo: repos,
		timeout:  cfg.Timeout,
	}

}

func (t *TgBot) Start(ctx context.Context) error {
	u := tgbotapi.NewUpdate(0)
	u.Timeout = t.timeout

	updates := t.bot.GetUpdatesChan(u)

	for {
		select {
		case update := <-updates:
			go t.handleUpdate(ctx, update)
		case <-ctx.Done():
			return ctx.Err()
		}
	}
}

func (t *TgBot) handleUpdate(ctx context.Context, update tgbotapi.Update) {
	if update.Message == nil {
		return
	}

	log.Printf("[%s] %s", update.Message.From.UserName, update.Message.Text)

	if update.Message.IsCommand() && update.Message.Command() == "login" {
		t.handleLoginCommand(ctx, update.Message)
		return
	}
}

func (t *TgBot) handleLoginCommand(ctx context.Context, message *tgbotapi.Message) {
	code := generateCode()

	dto := &repo.AuthDto{
		Code:       code,
		ExpiresAt:  time.Now().Add(5 * time.Minute),
		TelegramId: message.From.ID,
	}

	err := t.authRepo.Create(ctx, dto)
	if err != nil {
		log.Println(err)
		return
	}

	response := fmt.Sprintf("🔐 Ваш код для входа: `%s`\n\n"+
		"Используйте этот код в приложении для авторизации.\n"+
		"Код действителен в течение 5 минут.", code)

	msg := tgbotapi.NewMessage(message.Chat.ID, response)
	msg.ParseMode = "Markdown"

	if _, err := t.bot.Send(msg); err != nil {
		log.Printf("Failed to send message: %v", err)
	}

	log.Printf("Generated code %s for user %d (%s)",
		code, message.From.ID, message.From.UserName)
}
