package repo

import "context"

type Invite interface {
	CreateInvite(ctx context.Context, teamId int, recId int64) error
}
