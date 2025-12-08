.PHONY:

# Запустить сервис
up:
	docker compose up -d --build
# Остановить сервис, также удалить данные из базы, кроме тех, чтобы были захардкожены
down-v:
	docker compose down -v
# Остановить сервис
down:
	docker compose down