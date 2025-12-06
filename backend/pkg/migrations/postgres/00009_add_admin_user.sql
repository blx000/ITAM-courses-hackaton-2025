-- +goose Up
-- +goose StatementBegin
INSERT INTO hackmate.admin(login, password_hash)
VALUES
('user', '$argon2id$v=19$m=65536,t=1,p=4$z9zkpgAinHZqWorzXgtKdw$Dyn5vpGk94gCtK+HR9HkSs35Rez1W0Iy1/VR7iufhe0');

INSERT INTO hackmate.hackathon(admin_id, name, description, start_date, end_date, max_teams, max_team_size, prize)
VALUES
(1, 'ITAM HACK NAME', 'ITAM HACK DESC', '07-13-2025', '08-13-2025', 15, 5, 1800);


INSERT INTO hackmate.hackathon(admin_id, name, description, start_date, end_date, max_teams, max_team_size, prize)
VALUES
    (1, 'SECOND HACK', 'SECOND HACK DESC', '07-12-2024', '07-20-2024', 15, 5, 558);

--insert fake users
insert into hackmate.user(id, first_name, last_name, bio)
values
    (1234556, 'Ivan', 'Ivanov', 'MyBio');

insert into hackmate.user(id, first_name, last_name, bio)
values
    (1050682049, 'Semyon', 'Anikin', 'SA BIO');

insert into hackmate.participant(user_id, role_id, hack_id, experience, additional_info)
values
    (1234556, 1, 1, 5, 'Joined first hack IVan');

insert into hackmate.participant(user_id, role_id, hack_id, experience, additional_info)
values
    (1050682049, 1, 1, 5, 'Joined first hack Semyon');

insert into hackmate.auth(code, user_id, first_name, last_name, expires_at)
values
    ('123456', 1234556, 'Ivan', 'Ivanov', '12-12-2025');

insert into hackmate.auth(code, user_id, first_name, last_name, expires_at)
values
    ('228337', 1050682049, 'Semyon', 'Anikin', '12-12-2025');

insert into hackmate.team(name, captain_id, hackathon_id, max_size)
values
    ('Ivanov Team', 1, 1, 5);

insert into hackmate.team_participant(participant_id, team_id)
values
    (1, 1);

insert into hackmate.join_request(team_id, participant_id)
values
    (1, 2);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
