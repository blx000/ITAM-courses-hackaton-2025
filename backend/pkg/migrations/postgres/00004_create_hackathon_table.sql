-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.hackathon (
    id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES hackmate.admin(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    max_teams INT NOT NULL,
    max_team_size INT NOT NULL
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.hackathon;
-- +goose StatementEnd
