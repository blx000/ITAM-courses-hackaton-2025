-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.participant (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES hackmate.user(id),
    role_id INT references hackmate.role(id),
    hack_id INT REFERENCES hackmate.hackathon(id),
    experience INT NOT NULL,
    additional_info TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackmate.participant_skill (
    participant_id BIGINT,
    skill_id INT,
    PRIMARY KEY(participant_id, skill_id),
    CONSTRAINT fk_participant FOREIGN KEY(participant_id) REFERENCES hackmate.participant(id),
    CONSTRAINT fk_skill FOREIGN KEY(skill_id) REFERENCES hackmate.skill(id)
);

CREATE TABLE IF NOT EXISTS hackmate.team (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    captain_id BIGINT REFERENCES hackmate.participant(id),
    hackathon_id INT REFERENCES hackmate.hackathon(id),
    max_size INT NOT NULL
);


CREATE TABLE IF NOT EXISTS hackmate.team_role (
    team_id INT,
    role_id INT,
    PRIMARY KEY(team_id, role_id),
    CONSTRAINT fk_team FOREIGN KEY(team_id) REFERENCES hackmate.team(id),
    CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES hackmate.role(id)
);

CREATE TABLE IF NOT EXISTS hackmate.team_participant (
    participant_id BIGINT,
    team_id INT,
    PRIMARY KEY(participant_id, team_id),
    CONSTRAINT fk_participant FOREIGN KEY(participant_id) REFERENCES hackmate.participant(id),
    CONSTRAINT fk_team FOREIGN KEY(team_id) REFERENCES hackmate.team(id)
);



-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.team_participant;
DROP TABLE IF EXISTS hackmate.participant_skill;
DROP TABLE IF EXISTS hackmate.participant;
-- +goose StatementEnd
