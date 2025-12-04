-- +goose Up
-- +goose StatementBegin
create table if not exists hackmate.invite (
    id int primary key,
    team_id int references hackmate.team(id),
    form_id int references hackmate.form(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
drop table if exists invite;
-- +goose StatementEnd
