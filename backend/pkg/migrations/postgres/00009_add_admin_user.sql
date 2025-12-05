-- +goose Up
-- +goose StatementBegin
INSERT INTO hackmate.admin(login, password_hash)
VALUES
('user', '$argon2id$v=19$m=65536,t=1,p=4$z9zkpgAinHZqWorzXgtKdw$Dyn5vpGk94gCtK+HR9HkSs35Rez1W0Iy1/VR7iufhe0');

INSERT INTO hackmate.hackathon(admin_id, name, description, start_date, end_date, max_teams, max_team_size)
VALUES
(1, 'ITAM HACK NAME', 'ITAM HACK DESC', '07-13-2025', '08-13-2025', 15, 5);


-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
