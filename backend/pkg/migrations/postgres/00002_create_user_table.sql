-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.user (
    id BIGINT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    photo pg_catalog.bytea NOT NULL,
    bio TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackmate.admin (
    id SERIAL PRIMARY KEY,
    login TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.admin;
DROP TABLE IF EXISTS hackmate.user;
-- +goose StatementEnd
