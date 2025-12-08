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

func (s Server) GetApiUserInvites(ctx context.Context, request gen.GetApiUserInvitesRequestObject) (gen.GetApiUserInvitesResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return gen.GetApiUserInvites401Response{}, nil
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return gen.GetApiUserInvites401Response{}, nil
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return gen.GetApiUserInvites401Response{}, nil
	}

	invites, err := s.service.GetUsersInvites(ctx, user.ID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("get user invites: %w", err)
	}

	response := make([]gen.Invite, len(invites))

	for i, invite := range invites {
		response[i] = gen.Invite{
			Id:            invite.Id,
			ParticipantId: invite.ParticipantId,
			HackId:        invite.HackId,
			HackName:      invite.HackName,
			TeamId:        invite.TeamId,
			TeamName:      invite.TeamName,
		}
	}

	return gen.GetApiUserInvites200JSONResponse(response), nil
}

func (s Server) GetApiHacksHackIdTeamsTeamIdRequests(ctx context.Context, request gen.GetApiHacksHackIdTeamsTeamIdRequestsRequestObject) (gen.GetApiHacksHackIdTeamsTeamIdRequestsResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return gen.GetApiHacksHackIdTeamsTeamIdRequests401Response{}, nil
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return gen.GetApiHacksHackIdTeamsTeamIdRequests401Response{}, nil
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return gen.GetApiHacksHackIdTeamsTeamIdRequests401Response{}, nil
	}

	joinRequests, err := s.service.GetTeamsRequests(ctx, request.HackId, request.TeamId, user.ID)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, service.ErrUserWithoutTeam) {
			return gen.GetApiHacksHackIdTeamsTeamIdRequests403Response{}, nil
		}
	}

	response := make([]gen.Request, len(joinRequests))
	for i, req := range joinRequests {
		response[i] = gen.Request{
			Id:            req.Id,
			TeamId:        req.TeamId,
			FirstName:     req.FirstName,
			LastName:      req.LastName,
			ParticipantId: req.ParticipantId,
		}
	}

	return gen.GetApiHacksHackIdTeamsTeamIdRequests200JSONResponse(response), nil
}

func (s Server) PatchApiUser(ctx context.Context, request gen.PatchApiUserRequestObject) (gen.PatchApiUserResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return gen.PatchApiUser401Response{}, nil
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return gen.PatchApiUser401Response{}, nil
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return gen.PatchApiUser401Response{}, nil
	}

	userChange := &repo.UserChange{
		Id:        user.ID,
		FirstName: request.Body.FirstName,
		LastName:  request.Body.LastName,
		Bio:       request.Body.Bio,
		Username:  request.Body.Username,
	}

	newToken, err := s.service.ChangeUserInfo(ctx, userChange, s.hmacSecret)

	changeResponse := gen.UserChangeToken{
		AccessToken: newToken,
	}

	return gen.PatchApiUser200JSONResponse(changeResponse), nil
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

	userFromToken, err := jwt.ValidateToken(token, s.hmacSecret)

	if err != nil {
		fmt.Println(err)
		return gen.GetApiUser401Response{}, nil
	}

	// If user is admin, return data from token (admin is not in user table)
	if userFromToken.IsAdmin {
		firstName := userFromToken.FirstName
		lastName := userFromToken.LastName
		if firstName == "" {
			firstName = "Admin"
		}
		userResponse := gen.User{
			Id:        userFromToken.ID,
			FirstName: firstName,
			LastName:  lastName,
			Bio:       "",
			IsAdmin:   userFromToken.IsAdmin,
			Login:     userFromToken.Login,
			Username:  "",
		}
		return gen.GetApiUser200JSONResponse(userResponse), nil
	}

	userInfo, err := s.service.GetUserInfo(ctx, userFromToken.ID)
	if err != nil {
		fmt.Println(err)
		return gen.GetApiUser401Response{}, nil
	}

	userResponse := gen.User{
		Id:        userInfo.ID,
		FirstName: userInfo.FirstName,
		LastName:  userInfo.LastName,
		Bio:       userInfo.Bio,
		IsAdmin:   userInfo.IsAdmin,
		Login:     userInfo.Login,
		Username:  userInfo.UserName,
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
		MaxTeams:    15, // Default value
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

func (s Server) PatchApiAdminHacksHackId(ctx context.Context, request gen.PatchApiAdminHacksHackIdRequestObject) (gen.PatchApiAdminHacksHackIdResponseObject, error) {
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

	hackDTO := &repo.HackathonGeneralDTO{
		Name:        request.Body.Name,
		Desc:        request.Body.Description,
		StartDate:   request.Body.StartDate.Time,
		EndDate:     request.Body.EndDate.Time,
		MaxTeamSize: request.Body.MaxTeamSize,
		Prize:       request.Body.Prize,
	}

	err = s.service.UpdateHack(ctx, request.HackId, hackDTO)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, repo.ErrHackathonNotFound) {
			return gen.PatchApiAdminHacksHackId404Response{}, nil
		}
		return nil, fmt.Errorf("Update hack failed")
	}

	hack, err := s.service.GetHack(ctx, request.HackId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("Failed to get updated hack")
	}

	var prize *int
	if hack.Prize > 0 {
		prize = &hack.Prize
	}

	hackResponse := gen.HackathonShort{
		Id:          hack.Id,
		Name:        hack.Name,
		Description: hack.Desc,
		StartDate:   openapi_types.Date{hack.StartDate},
		EndDate:     openapi_types.Date{hack.EndDate},
		Prize:       prize,
	}

	return gen.PatchApiAdminHacksHackId200JSONResponse(hackResponse), nil
}

func (s Server) DeleteApiAdminHacksHackId(ctx context.Context, request gen.DeleteApiAdminHacksHackIdRequestObject) (gen.DeleteApiAdminHacksHackIdResponseObject, error) {
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

	err = s.service.DeleteHack(ctx, request.HackId)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, repo.ErrHackathonNotFound) {
			return gen.DeleteApiAdminHacksHackId404Response{}, nil
		}
		return nil, fmt.Errorf("Delete hack failed")
	}

	return gen.DeleteApiAdminHacksHackId200Response{}, nil
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
		prize := hacks[i].Prize
		hackResponse[i] = gen.HackathonShort{
			Name:        hacks[i].Name,
			Description: hacks[i].Desc,
			StartDate:   openapi_types.Date{hacks[i].StartDate},
			EndDate:     openapi_types.Date{hacks[i].EndDate},
			Id:          hacks[i].Id,
			Prize:       &prize,
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
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("unauthorized")
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return nil, fmt.Errorf("unauthorized")
	}

	user, err := jwt.ValidateToken(token, s.hmacSecret)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("unauthorized")
	}

	// Получаем участника пользователя по userId
	participant, err := s.service.GetParticipant(ctx, request.HackId, user.ID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to get participant: %w", err)
	}

	// Проверяем, что пользователь состоит в команде
	if participant.TeamId == service.TeamNull {
		return gen.GetApiHacksHackIdInvitations200JSONResponse([]gen.Invite{}), nil
	}

	// Получаем приглашения, отправленные командой
	invites, err := s.service.GetTeamInvites(ctx, request.HackId, participant.TeamId, user.ID)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, service.ErrUserWithoutTeam) {
			return gen.GetApiHacksHackIdInvitations200JSONResponse([]gen.Invite{}), nil
		}
		return nil, fmt.Errorf("get team invites: %w", err)
	}

	response := make([]gen.Invite, len(invites))
	for i, invite := range invites {
		response[i] = gen.Invite{
			Id:            invite.Id,
			ParticipantId: invite.ParticipantId,
			HackId:        invite.HackId,
			HackName:      invite.HackName,
			TeamId:        invite.TeamId,
			TeamName:      invite.TeamName,
		}
	}

	return gen.GetApiHacksHackIdInvitations200JSONResponse(response), nil
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
			AddInfo:    participants[i].AddInfo,
			Experience: participants[i].Experience,
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
		AddInfo:    participant.AddInfo,
		Experience: participant.Experience,
	}

	return gen.GetApiHacksHackIdParticipantsParticipantId200JSONResponse(participantResponse), nil
}

func (s Server) PatchApiHacksHackIdParticipantsParticipantId(ctx context.Context, request gen.PatchApiHacksHackIdParticipantsParticipantIdRequestObject) (gen.PatchApiHacksHackIdParticipantsParticipantIdResponseObject, error) {
	bearer, ok := ctx.Value(AuthorizationHeader).(string)
	if !ok {
		fmt.Println("Empty token")
		return gen.PatchApiHacksHackIdParticipantsParticipantId401Response{}, nil
	}

	token := strings.Split(bearer, " ")[1]
	if token == "" {
		fmt.Println("Empty token")
		return gen.PatchApiHacksHackIdParticipantsParticipantId401Response{}, nil
	}

	_, err := jwt.ValidateToken(token, s.hmacSecret)
	if err != nil {
		fmt.Println(err)
		return gen.PatchApiHacksHackIdParticipantsParticipantId401Response{}, nil
	}

	var roleId *int
	if request.Body.RoleId != nil {
		roleIdValue := int(*request.Body.RoleId)
		roleId = &roleIdValue
	}

	var skillIds []int
	if request.Body.SkillIds != nil {
		skillIds = make([]int, len(*request.Body.SkillIds))
		for i, id := range *request.Body.SkillIds {
			skillIds[i] = int(id)
		}
	}

	var experience *int
	if request.Body.Experience != nil {
		expValue := int(*request.Body.Experience)
		experience = &expValue
	}

	var additionalInfo *string
	if request.Body.AdditionalInfo != nil {
		additionalInfo = request.Body.AdditionalInfo
	}

	err = s.service.UpdateParticipant(ctx, request.HackId, request.ParticipantId, roleId, skillIds, experience, additionalInfo)
	if err != nil {
		fmt.Println(err)
		return gen.PatchApiHacksHackIdParticipantsParticipantId404Response{}, nil
	}

	return gen.PatchApiHacksHackIdParticipantsParticipantId200Response{}, nil
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
			return gen.PostApiHacksHackIdParticipantsParticipantsIdInvite403Response{}, nil
		}
		if errors.Is(err, service.ErrOnlyCaptainCanAcceptRequests) {
			return gen.PostApiHacksHackIdParticipantsParticipantsIdInvite403Response{}, nil
		}
		if errors.Is(err, service.ErrUserAlreadyJoinedTeam) {
			return gen.PostApiHacksHackIdParticipantsParticipantsIdInvite403Response{}, nil
		}
		return gen.PostApiHacksHackIdParticipantsParticipantsIdInvite403Response{}, nil
	}

	return gen.PostApiHacksHackIdParticipantsParticipantsIdInvite201Response{}, nil
}

func (s Server) GetApiHacksHackIdRequests(ctx context.Context, request gen.GetApiHacksHackIdRequestsRequestObject) (gen.GetApiHacksHackIdRequestsResponseObject, error) {
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
			for k := range participants[j].Skills {
				skillsResponse[k] = gen.Skill{Name: participants[j].Skills[k].Name, Id: participants[j].Skills[k].ID}
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
				AddInfo: participants[j].AddInfo,
			}
		}
		neededRolesResponse := make([]gen.Role, len(teams[i].NeededRoles))
		for k := range teams[i].NeededRoles {
			neededRolesResponse[k] = gen.Role{
				Id:   teams[i].NeededRoles[k].ID,
				Name: teams[i].NeededRoles[k].Name,
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
		
		if len(neededRolesResponse) > 0 {
			teamsResponse[i].NeededRoles = &neededRolesResponse
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

	var roleIds []int
	if request.Body.RoleIds != nil {
		roleIds = make([]int, len(*request.Body.RoleIds))
		for i, id := range *request.Body.RoleIds {
			roleIds[i] = int(id)
		}
	}

	err = s.service.CreateTeam(ctx, user.ID, request.HackId, request.Body.Name, roleIds)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, service.ErrUserAlreadyJoinedTeam) {
			return gen.PostApiHacksHackIdTeams400Response{}, nil
		}
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
			AddInfo: participants[i].AddInfo,
		}
	}

	neededRolesResponse := make([]gen.Role, len(team.NeededRoles))
	for i := range team.NeededRoles {
		neededRolesResponse[i] = gen.Role{
			Id:   team.NeededRoles[i].ID,
			Name: team.NeededRoles[i].Name,
		}
	}

	teamsResponse := gen.Team{
		Id:        team.ID,
		Members:   participantsResponse,
		Name:      team.Name,
		CaptainId: team.CaptainId,
		MaxSize:   team.MaxTeamSize,
		CurSize:   team.MemberCnt,
	}
	
	if len(neededRolesResponse) > 0 {
		teamsResponse.NeededRoles = &neededRolesResponse
	}

	return gen.GetApiHacksHackIdTeamsTeamId200JSONResponse(teamsResponse), nil
}

func (s Server) PatchApiHacksHackIdTeamsTeamId(ctx context.Context, request gen.PatchApiHacksHackIdTeamsTeamIdRequestObject) (gen.PatchApiHacksHackIdTeamsTeamIdResponseObject, error) {
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

	team, err := s.service.GetTeam(ctx, request.HackId, request.TeamId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("team not found: %w", err)
	}

	if team.CaptainId != int(user.ID) {
		return nil, fmt.Errorf("permission denied")
	}

	var roleIds []int
	if request.Body != nil && len(request.Body.RoleIds) > 0 {
		roleIds = make([]int, len(request.Body.RoleIds))
		for i, id := range request.Body.RoleIds {
			roleIds[i] = int(id)
		}
	}

	err = s.service.UpdateTeamRoles(ctx, request.TeamId, roleIds)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to update team roles: %w", err)
	}

	return gen.PatchApiHacksHackIdTeamsTeamId200Response{}, nil
}

func (s Server) PostApiHacksHackIdTeamsTeamIdRequest(ctx context.Context, request gen.PostApiHacksHackIdTeamsTeamIdRequestRequestObject) (gen.PostApiHacksHackIdTeamsTeamIdRequestResponseObject, error) {
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

	err = s.service.CreateJoinRequest(ctx, request.HackId, request.TeamId, user.ID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to create hack join request: %w", err)
	}

	return gen.PostApiHacksHackIdTeamsTeamIdRequest201Response{}, nil
}

func (s Server) PostApiHacksHackIdRequestsRequestIdAccept(ctx context.Context, request gen.PostApiHacksHackIdRequestsRequestIdAcceptRequestObject) (gen.PostApiHacksHackIdRequestsRequestIdAcceptResponseObject, error) {
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

	err = s.service.AcceptJoinRequest(ctx, request.HackId, request.RequestId, user.ID)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, service.ErrOnlyCaptainCanAcceptRequests) {
			return gen.PostApiHacksHackIdRequestsRequestIdAccept403Response{}, nil
		}
		return nil, fmt.Errorf("failed to accept join request: %w", err)
	}

	return gen.PostApiHacksHackIdRequestsRequestIdAccept200Response{}, nil
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

	user, err := s.service.GetUserInfo(ctx, request.UserId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}

	userResponse := gen.User{
		Id:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Username:  user.UserName,
		Bio:       user.Bio,
	}

	return gen.GetApiUsersUserId200JSONResponse(userResponse), nil
}

func (s Server) GetApiUsersUserIdTeams(ctx context.Context, request gen.GetApiUsersUserIdTeamsRequestObject) (gen.GetApiUsersUserIdTeamsResponseObject, error) {
	//bearer, ok := ctx.Value(AuthorizationHeader).(string)
	//if !ok {
	//	fmt.Println("Empty token")
	//	return nil, fmt.Errorf("Empty token")
	//}
	//
	//token := strings.Split(bearer, " ")[1]
	//if token == "" {
	//	fmt.Println("Empty token")
	//	return nil, fmt.Errorf("Empty token")
	//}
	//
	//_, err := jwt.ValidateToken(token, s.hmacSecret)
	//if err != nil {
	//	fmt.Println(err)
	//	return nil, fmt.Errorf("Unauthorized")
	//}

	teams, err := s.service.GetUsersTeams(ctx, request.UserId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to get users teams: %w", err)
	}

	teamsResponse := make([]gen.TeamShort, len(teams))

	for i, team := range teams {
		teamsResponse[i] = gen.TeamShort{
			Id:       team.ID,
			HackId:   team.HackId,
			Name:     team.Name,
			CurSize:  team.MemberCnt,
			MaxSize:  team.MaxTeamSize,
			HackName: team.HackName,
		}
	}

	return gen.GetApiUsersUserIdTeams200JSONResponse(teamsResponse), nil
}

func RequestInContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), "Authorization", r.Header.Get("Authorization"))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
