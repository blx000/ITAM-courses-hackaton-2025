package repo

import "context"

type Team interface {
	Create(ctx context.Context, name string, captainId int64, hackId int64) error
	DeleteMember(ctx context.Context, id int, memberId int64) error
	AddMember(ctx context.Context, id int, memberId int64) error
	Update(ctx context.Context, name string, captainId int64, hackId int64) error
	ReadByHackId(ctx context.Context, hackId int64) ([]*TeamDTO, error)
}

type TeamDTO struct {
	ID        int
	CaptainId int
	HackId    int
	Name      string
	Members   []*User
}

type TeamShort struct {
	ID        int
	CaptainId int
	HackId    int
	Name      string
	Members   []*Participant
	MemberCnt int
}
