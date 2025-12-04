package app

import (
	"context"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/config"
)

func Start(cfg config.Config) error {
	_, cancel := context.WithCancel(context.Background())

	defer cancel()
	return nil
}
