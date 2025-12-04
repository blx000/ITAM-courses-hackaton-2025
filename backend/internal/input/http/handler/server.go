package handler

import (
	"context"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/input/http/gen"
)

var _ gen.StrictServerInterface = (*Server)(nil)

type Server struct {
}

func NewServer() *Server {
	return &Server{}
}

func (s Server) PostAdminHacks(ctx context.Context, request gen.PostAdminHacksRequestObject) (gen.PostAdminHacksResponseObject, error) {
	//TODO implement me
	panic("implement me")

}

func (s Server) PostAdminLogin(ctx context.Context, request gen.PostAdminLoginRequestObject) (gen.PostAdminLoginResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacks(ctx context.Context, request gen.GetHacksRequestObject) (gen.GetHacksResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacksHackId(ctx context.Context, request gen.GetHacksHackIdRequestObject) (gen.GetHacksHackIdResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostHacksHackIdEnter(ctx context.Context, request gen.PostHacksHackIdEnterRequestObject) (gen.PostHacksHackIdEnterResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacksHackIdInvitations(ctx context.Context, request gen.GetHacksHackIdInvitationsRequestObject) (gen.GetHacksHackIdInvitationsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacksHackIdInvitationsInviteIdAccept(ctx context.Context, request gen.GetHacksHackIdInvitationsInviteIdAcceptRequestObject) (gen.GetHacksHackIdInvitationsInviteIdAcceptResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacksHackIdParticipants(ctx context.Context, request gen.GetHacksHackIdParticipantsRequestObject) (gen.GetHacksHackIdParticipantsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacksHackIdParticipantsParticipantId(ctx context.Context, request gen.GetHacksHackIdParticipantsParticipantIdRequestObject) (gen.GetHacksHackIdParticipantsParticipantIdResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostHacksHackIdParticipantsParticipantsIdInvite(ctx context.Context, request gen.PostHacksHackIdParticipantsParticipantsIdInviteRequestObject) (gen.PostHacksHackIdParticipantsParticipantsIdInviteResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacksHackIdRequests(ctx context.Context, request gen.GetHacksHackIdRequestsRequestObject) (gen.GetHacksHackIdRequestsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostHacksHackIdRequestsRequestIdAccept(ctx context.Context, request gen.PostHacksHackIdRequestsRequestIdAcceptRequestObject) (gen.PostHacksHackIdRequestsRequestIdAcceptResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacksHackIdTeams(ctx context.Context, request gen.GetHacksHackIdTeamsRequestObject) (gen.GetHacksHackIdTeamsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostHacksHackIdTeams(ctx context.Context, request gen.PostHacksHackIdTeamsRequestObject) (gen.PostHacksHackIdTeamsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetHacksHackIdTeamsTeamId(ctx context.Context, request gen.GetHacksHackIdTeamsTeamIdRequestObject) (gen.GetHacksHackIdTeamsTeamIdResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostHacksHackIdTeamsTeamIdRequest(ctx context.Context, request gen.PostHacksHackIdTeamsTeamIdRequestRequestObject) (gen.PostHacksHackIdTeamsTeamIdRequestResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostLogin(ctx context.Context, request gen.PostLoginRequestObject) (gen.PostLoginResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetUsersUserId(ctx context.Context, request gen.GetUsersUserIdRequestObject) (gen.GetUsersUserIdResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetUsersUserIdTeams(ctx context.Context, request gen.GetUsersUserIdTeamsRequestObject) (gen.GetUsersUserIdTeamsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}
