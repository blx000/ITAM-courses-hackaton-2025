-- +goose Up
-- +goose StatementBegin
create table if not exists hackmate.invite (
    id serial primary key,
    team_id int references hackmate.team(id),
    participant_id int references hackmate.participant(id),
    unique (team_id, participant_id)
);

create table if not exists hackmate.join_request (
    id serial primary key,
    team_id int references hackmate.team(id),
    participant_id int references hackmate.participant(id),
    unique (team_id, participant_id)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
drop table if exists invite;
drop table if exists join_request;
-- +goose StatementEnd
