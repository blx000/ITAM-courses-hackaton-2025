-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.auth (
    code TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    expires_at TIMESTAMP not null,
    username TEXT NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.auth;
-- +goose StatementEnd
