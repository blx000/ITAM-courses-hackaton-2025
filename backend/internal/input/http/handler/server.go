package handler

import (
	"context"
	"errors"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/input/http/gen"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/usecases/service"
	"github.com/blx000/ITAM-courses-hackaton-2025/pkg/jwt"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"net/http"
	"strings"
)

var _ gen.StrictServerInterface = (*Server)(nil)

const (
	AuthorizationHeader = "Authorization"
)

type Server struct {
	service    service.Service
	hmacSecret string
}

func (s Server) GetApiHacksMy(ctx context.Context, request gen.GetApiHacksMyRequestObject) (gen.GetApiHacksMyResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return gen.GetApiHacksMy401Response{}, nil
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return gen.GetApiHacksMy401Response{}, nil
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return gen.GetApiHacksMy401Response{}, nil
	}
	hacks, err := s.service.GetUsersHacks(ctx, user.ID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to get users hacks: %w", err)
	}

	hackResponse := make([]gen.HackathonShort, len(hacks))

	for i := range hacks {
		hackResponse[i] = gen.HackathonShort{
			Name:        hacks[i].Name,
			Description: hacks[i].Desc,
			StartDate:   openapi_types.Date{hacks[i].StartDate},
			EndDate:     openapi_types.Date{hacks[i].EndDate},
			Id:          hacks[i].Id,
		}
	}

	return gen.GetApiHacksMy200JSONResponse(hackResponse), nil
}

func (s Server) GetApiHealthcheсk(ctx context.Context, request gen.GetApiHealthcheсkRequestObject) (gen.GetApiHealthcheсkResponseObject, error) {
	return gen.GetApiHealthcheсk200JSONResponse{
		Resp: "status ok",
	}, nil
}

func NewServer(service service.Service, hmacSecret string) *Server {
	return &Server{
		service:    service,
		hmacSecret: hmacSecret,
	}
}

func (s Server) GetApiUser(ctx context.Context, request gen.GetApiUserRequestObject) (gen.GetApiUserResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return gen.GetApiUser401Response{}, nil
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return gen.GetApiUser401Response{}, nil
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return gen.GetApiUser401Response{}, nil
	}

	userResponse := gen.User{
		Id:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Bio:       user.Bio,
		IsAdmin:   user.IsAdmin,
		Login:     user.Login,
	}

	return gen.GetApiUser200JSONResponse(userResponse), nil
}

func (s Server) GetApiRoles(ctx context.Context, request gen.GetApiRolesRequestObject) (gen.GetApiRolesResponseObject, error) {
	roles, err := s.service.ListRoles(ctx)
	if err != nil {
		return nil, err
	}

	rolesResponse := make([]gen.Role, len(roles))
	for i := range roles {
		rolesResponse[i] = gen.Role{
			Name: roles[i].Name,
			Id:   roles[i].ID,
		}
	}

	return gen.GetApiRoles200JSONResponse(rolesResponse), nil
}

func (s Server) GetApiSkills(ctx context.Context, request gen.GetApiSkillsRequestObject) (gen.GetApiSkillsResponseObject, error) {
	skills, err := s.service.ListSkills(ctx)
	if err != nil {
		return nil, err
	}

	skillsResponse := make([]gen.Skill, len(skills))
	for i := range skills {
		skillsResponse[i] = gen.Skill{
			Name: skills[i].Name,
			Id:   skills[i].ID,
		}
	}

	return gen.GetApiSkills200JSONResponse(skillsResponse), nil
}

func (s Server) PostApiAdminHacks(ctx context.Context, request gen.PostApiAdminHacksRequestObject) (gen.PostApiAdminHacksResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	if !user.IsAdmin {
		fmt.Println("User is not admin")
		return nil, fmt.Errorf("Permission denied")
	}

	hackDto := &repo.HackathonGeneralDTO{
		AdminId:     user.ID,
		Desc:        request.Body.Description,
		Name:        request.Body.Name,
		StartDate:   request.Body.StartDate.Time,
		EndDate:     request.Body.EndDate.Time,
		Prize:       request.Body.Prize,
		MaxTeamSize: request.Body.MaxTeamSize,
	}

	hackId, err := s.service.CreateHack(ctx, hackDto)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Create hack failed")
	}

	hackResponse := gen.HackathonShort{
		Id: hackId,
	}

	return gen.PostApiAdminHacks200JSONResponse(hackResponse), nil
}

func (s Server) PostApiAdminLogin(ctx context.Context, request gen.PostApiAdminLoginRequestObject) (gen.PostApiAdminLoginResponseObject, error) {
	if request.Body.Password == "" {
		return nil, fmt.Errorf("Wrong Password")
	}
	if request.Body.Login == "" {
		return nil, fmt.Errorf("Wrong Login")
	}
	accessToken, refreshToken, err := s.service.LoginAdmin(ctx, request.Body.Login, request.Body.Password, s.hmacSecret)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("LoginAdmin Error")
	}

	response := gen.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return gen.PostApiAdminLogin200JSONResponse(response), nil
}

func (s Server) GetApiHacks(ctx context.Context, request gen.GetApiHacksRequestObject) (gen.GetApiHacksResponseObject, error) {
	fmt.Println("FINDING HACKS")
	hacks, err := s.service.ListHacks(ctx)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to list hacks: %w", err)
	}

	hackResponse := make([]gen.HackathonShort, len(hacks))
	fmt.Println("FINDING HACKS ", len(hacks))

	for i := range hacks {
		hackResponse[i] = gen.HackathonShort{
			Name:        hacks[i].Name,
			Description: hacks[i].Desc,
			StartDate:   openapi_types.Date{hacks[i].StartDate},
			EndDate:     openapi_types.Date{hacks[i].EndDate},
			Id:          hacks[i].Id,
		}
	}

	return gen.GetApiHacks200JSONResponse(hackResponse), nil
}

func (s Server) GetApiHacksHackId(ctx context.Context, request gen.GetApiHacksHackIdRequestObject) (gen.GetApiHacksHackIdResponseObject, error) {
	//TODO implement me
	hack, err := s.service.GetHack(ctx, request.HackId)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, service.ErrHackNotFound) {
			return gen.GetApiHacksHackId404Response{}, nil
		}
		return nil, fmt.Errorf("failed to get hack: %w", err)
	}
	hackResponse := gen.HackathonPage{
		Id:          hack.Id,
		Name:        hack.Name,
		Description: hack.Desc,
		Prize:       hack.Prize,
		StartDate:   openapi_types.Date{hack.StartDate},
		EndDate:     openapi_types.Date{hack.EndDate},
		MaxTeamSize: hack.MaxTeamSize,
	}
	return gen.GetApiHacksHackId200JSONResponse(hackResponse), nil
}

func (s Server) PostApiHacksHackIdEnter(ctx context.Context, request gen.PostApiHacksHackIdEnterRequestObject) (gen.PostApiHacksHackIdEnterResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	skills := make([]repo.Skill, len(request.Body.Skills))
	for i := range request.Body.Skills {
		skills[i] = repo.Skill{
			Name: request.Body.Skills[i].Name,
			ID:   request.Body.Skills[i].Id,
		}
	}
	formCreate := repo.FormCreate{
		UserId:     user.ID,
		HackId:     request.HackId,
		Experience: request.Body.Experience,
		AddInfo:    request.Body.AdditionalInfo,
		SKills:     skills,
		Role: repo.Role{
			Name: request.Body.Role.Name,
			ID:   request.Body.Role.Id,
		},
	}
	err = s.service.EnterHackathon(ctx, formCreate)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, service.ErrUserAlreadyJoinedHackathon) {
			return gen.PostApiHacksHackIdEnter409Response{}, nil
		}
		return nil, fmt.Errorf("failed to enter hackathon: %w", err)
	}
	return gen.PostApiHacksHackIdEnter201Response{}, nil
}

func (s Server) GetApiHacksHackIdInvitations(ctx context.Context, request gen.GetApiHacksHackIdInvitationsRequestObject) (gen.GetApiHacksHackIdInvitationsResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) GetApiHacksHackIdInvitationsInviteIdAccept(ctx context.Context, request gen.GetApiHacksHackIdInvitationsInviteIdAcceptRequestObject) (gen.GetApiHacksHackIdInvitationsInviteIdAcceptResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	err = s.service.AcceptInvite(ctx, request.HackId, request.InviteId, user.ID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to accept invite: %w", err)
	}
	return gen.GetApiHacksHackIdInvitationsInviteIdAccept201Response{}, nil
}

func (s Server) GetApiHacksHackIdParticipants(ctx context.Context, request gen.GetApiHacksHackIdParticipantsRequestObject) (gen.GetApiHacksHackIdParticipantsResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	_, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	participants, err := s.service.ListParticipants(ctx, request.HackId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to list participants: %w", err)
	}

	participantsResponse := make([]gen.Participant, len(participants))

	for i := range participants {
		skillsResponse := make([]gen.Skill, len(participants[i].Skills))
		for j := range participants[i].Skills {
			skillsResponse[j] = gen.Skill{Name: participants[i].Skills[j].Name, Id: participants[i].Skills[j].ID}
		}
		participantsResponse[i] = gen.Participant{
			Id:        participants[i].Id,
			TeamId:    participants[i].TeamId,
			FirstName: participants[i].FirstName,
			LastName:  participants[i].LastName,
			Skills:    skillsResponse,
			Role: gen.Role{
				Id:   participants[i].Role.ID,
				Name: participants[i].Role.Name,
			},
		}
	}
	return gen.GetApiHacksHackIdParticipants200JSONResponse(participantsResponse), nil
}

func (s Server) GetApiHacksHackIdParticipantsParticipantId(ctx context.Context, request gen.GetApiHacksHackIdParticipantsParticipantIdRequestObject) (gen.GetApiHacksHackIdParticipantsParticipantIdResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	_, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	participant, err := s.service.GetParticipantProfile(ctx, request.HackId, request.ParticipantId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to find participant: %w", err)
	}

	skillsResponse := make([]gen.Skill, len(participant.Skills))
	for i := range participant.Skills {
		skillsResponse[i] = gen.Skill{
			Name: participant.Skills[i].Name,
			Id:   participant.Skills[i].ID,
		}
	}

	participantResponse := gen.Participant{
		Id:        participant.Id,
		TeamId:    participant.TeamId,
		FirstName: participant.FirstName,
		LastName:  participant.LastName,
		Skills:    skillsResponse,
		Role: gen.Role{
			Id:   participant.Role.ID,
			Name: participant.Role.Name,
		},
		AddInfo: participant.AddInfo,
	}

	return gen.GetApiHacksHackIdParticipantsParticipantId200JSONResponse(participantResponse), nil
}

func (s Server) PostApiHacksHackIdParticipantsParticipantsIdInvite(ctx context.Context, request gen.PostApiHacksHackIdParticipantsParticipantsIdInviteRequestObject) (gen.PostApiHacksHackIdParticipantsParticipantsIdInviteResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	err = s.service.CreateInvite(ctx, request.HackId, user.ID, request.ParticipantsId)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, service.ErrUserWithoutTeam) {
			return nil, fmt.Errorf("Invite sender without team")
		}
		return nil, fmt.Errorf("failed to invite: %w", err)
	}

	return gen.PostApiHacksHackIdParticipantsParticipantsIdInvite201Response{}, nil
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
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	_, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	teams, err := s.service.ListHackTeams(ctx, request.HackId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to list hack teams: %w", err)
	}
	teamsResponse := make([]gen.Team, len(teams))

	for i := range teams {
		participants := teams[i].Members
		participantsResponse := make([]gen.Participant, len(participants))
		for j := range participants {
			skillsResponse := make([]gen.Skill, len(participants[j].Skills))
			for k := range participants[i].Skills {
				skillsResponse[k] = gen.Skill{Name: participants[i].Skills[j].Name, Id: participants[i].Skills[j].ID}
			}
			participantsResponse[j] = gen.Participant{
				Id:        participants[j].Id,
				TeamId:    participants[j].TeamId,
				FirstName: participants[j].FirstName,
				LastName:  participants[j].LastName,
				Skills:    skillsResponse,
				Role: gen.Role{
					Id:   participants[j].Role.ID,
					Name: participants[j].Role.Name,
				},
			}
		}
		teamsResponse[i] = gen.Team{
			Name:      teams[i].Name,
			Id:        teams[i].ID,
			CaptainId: teams[i].CaptainId,
			Members:   participantsResponse,
			MaxSize:   teams[i].MaxTeamSize,
			CurSize:   teams[i].MemberCnt,
		}
	}
	return gen.GetApiHacksHackIdTeams200JSONResponse(teamsResponse), nil
}

func (s Server) PostApiHacksHackIdTeams(ctx context.Context, request gen.PostApiHacksHackIdTeamsRequestObject) (gen.PostApiHacksHackIdTeamsResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	err = s.service.CreateTeam(ctx, user.ID, request.HackId, request.Body.Name)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to create hack team: %w", err)
	}

	return gen.PostApiHacksHackIdTeams201JSONResponse{}, nil
}

func (s Server) GetApiHacksHackIdTeamsTeamId(ctx context.Context, request gen.GetApiHacksHackIdTeamsTeamIdRequestObject) (gen.GetApiHacksHackIdTeamsTeamIdResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("Empty token")
	}

	_, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Unauthorized")
	}

	team, err := s.service.GetTeam(ctx, request.HackId, request.TeamId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to list hack teams: %w", err)
	}
	participants := team.Members
	participantsResponse := make([]gen.Participant, len(participants))
	for i := range participants {
		skillsResponse := make([]gen.Skill, len(participants[i].Skills))
		for j := range participants[i].Skills {
			skillsResponse[j] = gen.Skill{Name: participants[i].Skills[j].Name, Id: participants[i].Skills[j].ID}
		}
		participantsResponse[i] = gen.Participant{
			Id:        participants[i].Id,
			TeamId:    participants[i].TeamId,
			FirstName: participants[i].FirstName,
			LastName:  participants[i].LastName,
			Skills:    skillsResponse,
			Role: gen.Role{
				Id:   participants[i].Role.ID,
				Name: participants[i].Role.Name,
			},
		}
	}

	teamsResponse := gen.Team{
		Id:        team.ID,
		Members:   participantsResponse,
		Name:      team.Name,
		CaptainId: team.CaptainId,
	}

	return gen.GetApiHacksHackIdTeamsTeamId200JSONResponse(teamsResponse), nil
}

func (s Server) PostApiHacksHackIdTeamsTeamIdRequest(ctx context.Context, request gen.PostApiHacksHackIdTeamsTeamIdRequestRequestObject) (gen.PostApiHacksHackIdTeamsTeamIdRequestResponseObject, error) {
	//TODO implement me
	panic("implement me")
}

func (s Server) PostApiLogin(ctx context.Context, request gen.PostApiLoginRequestObject) (gen.PostApiLoginResponseObject, error) {
	if len(request.Body.Code) != 6 {
		return nil, fmt.Errorf("Wrong code")
	}
	accessToken, refreshToken, err := s.service.LoginUser(ctx, request.Body.Code, s.hmacSecret)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("LoginUser Error")
	}

	response := gen.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return gen.PostApiLogin200JSONResponse(response), nil
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
