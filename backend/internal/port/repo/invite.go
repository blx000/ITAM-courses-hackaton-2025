package repo

import "context"

type Invite interface {
	CreateInvite(ctx context.Context, teamId int, recId int64) error
}

type Invitation struct {
	Id            int
	TeamId        int
	ParticipantId int
	HackId        int
}

type JoinRequest struct {
	Id            int
	TeamId        int
	CaptainId     int
	ParticipantId int
	HackId        int
}
