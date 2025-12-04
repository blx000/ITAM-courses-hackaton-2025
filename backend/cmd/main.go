package main

import (
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/app"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/config"
)

func main() {
	cfg := config.MustLoad()

	if err := app.Start(cfg); err != nil {
		panic(err)
	}
}
