.PHONY:

up:
	docker compose up -d --build

down-v:
	docker compose down -v

down:
	docker compose down