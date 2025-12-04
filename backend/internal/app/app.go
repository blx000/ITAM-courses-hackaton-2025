package app

import (
	"context"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/adapter/repo/postgres"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/config"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/usecases/bot"
	"go.uber.org/zap"
	"os"
	"os/signal"
	"syscall"
)

func Start(cfg config.Config) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pgPool, err := postgres.NewPostgresPool(ctx, cfg.Postgres)
	if err != nil {
		return err
	}

	logger, err := zap.NewProduction()

	defer cancel()
	defer logger.Sync()

	if err != nil {
		return err
	}

	authRepo := postgres.NewAuthRepo(pgPool)
	tgBot := bot.NewTgBot(cfg.TgBot, authRepo)

	go tgBot.Start(ctx)

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)

	sign := <-stop
	cancel()

	logger.Info("Stopping application", zap.String("signal", sign.String()))

	return nil
}
