-- +goose Up
-- +goose StatementBegin
CREATE SCHEMA IF NOT EXISTS hackmate;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP SCHEMA IF EXISTS hackmate;
-- +goose StatementEnd
