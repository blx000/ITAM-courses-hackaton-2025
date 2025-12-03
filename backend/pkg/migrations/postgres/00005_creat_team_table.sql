-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.team (
    id SERIAL PRIMARY KEY,
    captain_id BIGINT REFERENCES hackmate.user(id),
    hackathon_id INT REFERENCES hackmate.hackaton(id),
    photo_url TEXT NOT NULL,
    max_size INT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackmate.team_user(
    user_id BIGINT,
    team_id INT,
    PRIMARY KEY(user_id, team_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES hackmate.user(id),
    CONSTRAINT fk_team FOREIGN KEY(team_id) REFERENCES hackmate.team(id)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.team_user;
DROP TABLE IF EXISTS hackmate.team;
-- +goose StatementEnd
