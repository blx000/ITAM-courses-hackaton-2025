-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.role (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

INSERT INTO hackmate.role(name)
VALUES
('Backend'),
('Frontend'),
('Design'),
('ML'),
('DevOps'),
('Product');


CREATE TABLE IF NOT EXISTS hackmate.skill (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.role;
DROP TABLE IF EXISTS hackmate.skill;
-- +goose StatementEnd
