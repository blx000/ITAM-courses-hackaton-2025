-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.team (
    id SERIAL PRIMARY KEY,
    captain_id BIGINT REFERENCES hackmate.user(id),
    hackathon_id INT REFERENCES hackmate.hackaton(id),
    max_size INT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackmate.team_form(
    form_id BIGINT,
    team_id INT,
    PRIMARY KEY(form_id, team_id),
    CONSTRAINT fk_form FOREIGN KEY(form_id) REFERENCES hackmate.form(id),
    CONSTRAINT fk_team FOREIGN KEY(team_id) REFERENCES hackmate.team(id)
);

CREATE TABLE IF NOT EXISTS hackmate.team_role (
    team_id INT,
    role_id INT,
    PRIMARY KEY(team_id, role_id),
    CONSTRAINT fk_team FOREIGN KEY(team_id) REFERENCES hackmate.team(id),
    CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES hackmate.role(id)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.team_user;
DROP TABLE IF EXISTS hackmate.team;
-- +goose StatementEnd
