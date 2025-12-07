-- +goose Up
-- +goose StatementBegin
create table if not exists hackmate.notifications (
    id serial primary key,
    message text not null,
    participant_id BIGINT references hackmate.participant(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
drop table if exists hackmate.notifications;
-- +goose StatementEnd
