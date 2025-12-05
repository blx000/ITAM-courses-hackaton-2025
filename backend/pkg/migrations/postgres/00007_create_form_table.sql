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
