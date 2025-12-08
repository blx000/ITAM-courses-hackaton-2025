package team

import (
	"context"
	"errors"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
)

type TeamCase struct {
	teamRepo   repo.Team
	formRepo   repo.Form
	inviteRepo repo.Invite
}

var (
	ErrPermissionDenied = errors.New("permission denied")
)

func NewTeamCase(team repo.Team) *TeamCase {
	return &TeamCase{teamRepo: team}
}

func (t *TeamCase) Create(ctx context.Context, name string, captainId int64, hackId int64) error {
	return t.teamRepo.Create(ctx, name, captainId, hackId)
}

func (t *TeamCase) AcceptInvite(ctx context.Context, formId int64, teamId int) error {
	return t.teamRepo.AddMember(ctx, teamId, formId)
}

func (t *TeamCase) CreateInvite(ctx context.Context, formOwnerId int64, teamId int, formAcceptId int64) error {
	form, err := t.formRepo.GetForm(ctx, formOwnerId)
	if err != nil {
		return err
	}
	if form.TeamId != teamId {
		return ErrPermissionDenied
	}
	err = t.inviteRepo.CreateInvite(ctx, teamId, formAcceptId)

	// TODO: add notification
	if err != nil {
		return err
	}

	panic("not implemented")
	return nil
}

func (t *TeamCase) DeleteMember(ctx context.Context, teamId int, memberId int64) error {
	return t.teamRepo.DeleteMember(ctx, teamId, memberId)
}
