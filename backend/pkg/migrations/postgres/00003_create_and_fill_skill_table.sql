-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.skill (
    id SERIAL PRIMARY KEY,
    name TEXT
);

INSERT INTO hackmate.skill(name)
VALUES
('Backend'),
('Frontend'),
('Design'),
('ML'),
('DevOps'),
('Product');

CREATE TABLE IF NOT EXISTS hackmate.user_skill (
    user_id BIGINT,
    skill_id INT,
    PRIMARY KEY(user_id, skill_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES hackmate.user(id),
    CONSTRAINT fk_skill FOREIGN KEY(user_id) REFERENCES hackmate.skill(id)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS hackmate.user_skill;
DROP TABLE IF EXISTS hackmate.skill;
-- +goose StatementEnd
