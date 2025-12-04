-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS hackmate.form (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES hackmate.user(id),
    hack_id INT REFERENCES hackmate.hackathon(id),
    experience INT NOT NULL,
    additional_info TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hackmate.form_role (
    form_id BIGINT,
    role_id INT,
    PRIMARY KEY(form_id, role_id),
    CONSTRAINT fk_form FOREIGN KEY(form_id) REFERENCES hackmate.user(id),
    CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES hackmate.role(id)
);

CREATE TABLE IF NOT EXISTS hackmate.form_skill (
    form_id BIGINT,
    skill_id INT,
    PRIMARY KEY(form_id, skill_id),
    CONSTRAINT fk_form FOREIGN KEY(form_id) REFERENCES hackmate.user(id),
    CONSTRAINT fk_skill FOREIGN KEY(skill_id) REFERENCES hackmate.skill(id)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
