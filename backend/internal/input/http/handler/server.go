package handler

import (
	"context"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/input/http/gen"
	"net/http"
)

var _ gen.StrictServerInterface = (*Server)(nil)

const (
	AuthorizationHeader = "Authorization"
)

type Server struct {
}

func (s Server) GetApiRoles(ctx context.Context, request gen.GetApiRolesRequestObject) (gen.GetApiRolesResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiSkills(ctx context.Context, request gen.GetApiSkillsRequestObject) (gen.GetApiSkillsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func NewServer() *Server {
	return &Server{}
}

func (s Server) PostApiAdminHacks(ctx context.Context, request gen.PostApiAdminHacksRequestObject) (gen.PostApiAdminHacksResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostApiAdminLogin(ctx context.Context, request gen.PostApiAdminLoginRequestObject) (gen.PostApiAdminLoginResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacks(ctx context.Context, request gen.GetApiHacksRequestObject) (gen.GetApiHacksResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackId(ctx context.Context, request gen.GetApiHacksHackIdRequestObject) (gen.GetApiHacksHackIdResponseObject, error) {
	//TODO implement me

	return gen.GetApiHacksHackId200JSONResponse{
		Description: "description",
	}, nil

}

func (s Server) PostApiHacksHackIdEnter(ctx context.Context, request gen.PostApiHacksHackIdEnterRequestObject) (gen.PostApiHacksHackIdEnterResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackIdInvitations(ctx context.Context, request gen.GetApiHacksHackIdInvitationsRequestObject) (gen.GetApiHacksHackIdInvitationsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackIdInvitationsInviteIdAccept(ctx context.Context, request gen.GetApiHacksHackIdInvitationsInviteIdAcceptRequestObject) (gen.GetApiHacksHackIdInvitationsInviteIdAcceptResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackIdParticipants(ctx context.Context, request gen.GetApiHacksHackIdParticipantsRequestObject) (gen.GetApiHacksHackIdParticipantsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackIdParticipantsParticipantId(ctx context.Context, request gen.GetApiHacksHackIdParticipantsParticipantIdRequestObject) (gen.GetApiHacksHackIdParticipantsParticipantIdResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostApiHacksHackIdParticipantsParticipantsIdInvite(ctx context.Context, request gen.PostApiHacksHackIdParticipantsParticipantsIdInviteRequestObject) (gen.PostApiHacksHackIdParticipantsParticipantsIdInviteResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackIdRequests(ctx context.Context, request gen.GetApiHacksHackIdRequestsRequestObject) (gen.GetApiHacksHackIdRequestsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostApiHacksHackIdRequestsRequestIdAccept(ctx context.Context, request gen.PostApiHacksHackIdRequestsRequestIdAcceptRequestObject) (gen.PostApiHacksHackIdRequestsRequestIdAcceptResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackIdTeams(ctx context.Context, request gen.GetApiHacksHackIdTeamsRequestObject) (gen.GetApiHacksHackIdTeamsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostApiHacksHackIdTeams(ctx context.Context, request gen.PostApiHacksHackIdTeamsRequestObject) (gen.PostApiHacksHackIdTeamsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackIdTeamsTeamId(ctx context.Context, request gen.GetApiHacksHackIdTeamsTeamIdRequestObject) (gen.GetApiHacksHackIdTeamsTeamIdResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostApiHacksHackIdTeamsTeamIdRequest(ctx context.Context, request gen.PostApiHacksHackIdTeamsTeamIdRequestRequestObject) (gen.PostApiHacksHackIdTeamsTeamIdRequestResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHealthchek(ctx context.Context, request gen.GetApiHealthchekRequestObject) (gen.GetApiHealthchekResponseObject, error) {
	//TODO implement me
	return gen.GetApiHealthchek200JSONResponse{
		Resp: "heaylth",
	}, nil
}

func (s Server) PostApiLogin(ctx context.Context, request gen.PostApiLoginRequestObject) (gen.PostApiLoginResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiUsersUserId(ctx context.Context, request gen.GetApiUsersUserIdRequestObject) (gen.GetApiUsersUserIdResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiUsersUserIdTeams(ctx context.Context, request gen.GetApiUsersUserIdTeamsRequestObject) (gen.GetApiUsersUserIdTeamsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func RequestInContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), "Authorization", r.Header.Get("Authorization"))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
