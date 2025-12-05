package app

import (
	"context"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/adapter/repo/postgres"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/config"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/input/http/gen"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/input/http/handler"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/usecases/bot"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/usecases/service"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"go.uber.org/zap"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
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
	userRepo := postgres.NewUserRepo(pgPool)
	hackRepo := postgres.NewHackRepo(pgPool)
	formRepo := postgres.NewFormRepo(pgPool)

	tgBot := bot.NewTgBot(cfg.TgBot, authRepo)

	service := service.NewServiceImpl(formRepo, authRepo, hackRepo, userRepo)

	go tgBot.Start(ctx)

	server := handler.NewServer(service, cfg.SecretJWT)

	strictHandler := gen.NewStrictHandler(server, nil)

	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(60 * time.Second))
	router.Use(handler.RequestInContext)

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	gen.HandlerWithOptions(strictHandler, gen.ChiServerOptions{
		BaseRouter: router,
	})

	httpServer := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Port),
		Handler: router,
	}

	fmt.Println("Listening on port", cfg.Port)
	fmt.Println("Addr", httpServer.Addr)

	go httpServer.ListenAndServe()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)

	sign := <-stop
	cancel()

	logger.Info("Stopping application", zap.String("signal", sign.String()))

	return nil
}
