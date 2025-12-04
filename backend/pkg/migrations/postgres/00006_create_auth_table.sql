-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.auth (
    code TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP not null
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.auth;
-- +goose StatementEnd
