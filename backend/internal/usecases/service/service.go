package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/blx000/ITAM-courses-hackaton-2025/pkg/jwt"
	"time"
)

const (
	TeamNull = -1
)

var (
	ErrHackNotFound                 = errors.New("hack not found")
	ErrAuthCodeNotFound             = errors.New("auth code not found")
	ErrUserAlreadyJoinedHackathon   = errors.New("user already joined hackathon")
	ErrUserAlreadyJoinedTeam        = errors.New("user already joined team")
	ErrUserNotFound                 = errors.New("user not found")
	ErrInvalidCredentials           = errors.New("invalid credentials")
	ErrOnlyCaptainCanAcceptRequests = errors.New("only captain can accept requests")
	ErrUserWithoutTeam              = errors.New("user without team")
)

type Service interface {
	LoginUser(ctx context.Context, code string, secret string) (string, string, error)
	LoginAdmin(ctx context.Context, login string, password string, secret string) (string, string, error)

	ListSkills(ctx context.Context) ([]*repo.Skill, error)
	ListRoles(ctx context.Context) ([]*repo.Role, error)

	ListHacks(ctx context.Context) ([]*repo.HackathonGeneralDTO, error)
	GetHack(ctx context.Context, hackId int) (*repo.HackathonGeneralDTO, error)
	CreateHack(ctx context.Context, hack *repo.HackathonGeneralDTO) (int, error)
	EnterHackathon(ctx context.Context, create repo.FormCreate) error
	ListParticipants(ctx context.Context, hackId int) ([]*repo.Participant, error)
	ListHackTeams(ctx context.Context, hackId int) ([]*repo.TeamShort, error)
	GetTeam(ctx context.Context, hackId int, teamId int) (*repo.TeamShort, error)
	CreateTeam(ctx context.Context, userId int64, hackId int, name string) error
	GetParticipantProfile(ctx context.Context, hackId int, participantId int) (*repo.Participant, error)
	GetUsersHacks(ctx context.Context, userId int64) ([]*repo.HackathonGeneralDTO, error)

	CreateInvite(ctx context.Context, hackId int, senderId int64, rectId int) error
	CreateJoinRequest(ctx context.Context, hackId int, teamId int, userId int64) error
	AcceptInvite(ctx context.Context, hackId int, inviteId int, userId int64) error
	AcceptJoinRequest(ctx context.Context, hackId int, requestId int, userId int64) error
}

var _ Service = (*ServiceImpl)(nil)

type ServiceImpl struct {
	formRepo repo.Form
	authRepo repo.Auth
	hackRepo repo.Hackathon
	userRepo repo.User
}

func (s *ServiceImpl) GetUsersHacks(ctx context.Context, userId int64) ([]*repo.HackathonGeneralDTO, error) {
	return s.hackRepo.GetUsersHacks(ctx, userId)
}

func (s *ServiceImpl) CreateInvite(ctx context.Context, hackId int, senderId int64, rectId int) error {
	sender, err := s.hackRepo.GetParticipant(ctx, hackId, senderId)
	if err != nil {
		fmt.Println(err)
		return err
	}
	if sender.TeamId == TeamNull {
		return ErrUserWithoutTeam
	}
	receiver, err := s.hackRepo.GetParticipantGeneral(ctx, rectId)
	if err != nil {
		fmt.Println(err)
		return err
	}
	if receiver.TeamId != TeamNull {
		return ErrUserAlreadyJoinedTeam
	}

	err = s.hackRepo.CreateInvite(ctx, sender.TeamId, rectId)
	if err != nil {
		fmt.Println(err)

		return err
	}

	return nil
}

func (s *ServiceImpl) CreateJoinRequest(ctx context.Context, hackId int, teamId int, userId int64) error {
	participant, err := s.hackRepo.GetParticipant(ctx, hackId, userId)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to find participant")
	}
	if participant.TeamId != TeamNull {
		return ErrUserAlreadyJoinedTeam
	}

	err = s.hackRepo.CreateRequest(ctx, teamId, participant.Id)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to create request")
	}

	return nil
}

func (s *ServiceImpl) AcceptInvite(ctx context.Context, hackId int, inviteId int, userId int64) error {
	participant, err := s.hackRepo.GetParticipant(ctx, hackId, userId)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to get participant")
	}
	if participant.TeamId != TeamNull {
		return ErrUserAlreadyJoinedTeam
	}
	invite, err := s.hackRepo.GetInvite(ctx, inviteId)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to get invite")
	}
	if invite.ParticipantId != participant.Id {
		return fmt.Errorf("mismatch participant and invite.part_id")
	}

	err = s.hackRepo.AcceptInvite(ctx, inviteId, invite.TeamId, participant.Id)
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}

func (s *ServiceImpl) AcceptJoinRequest(ctx context.Context, hackId int, requestId int, userId int64) error {
	participant, err := s.hackRepo.GetParticipant(ctx, hackId, userId)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to get participant %w", err)
	}

	joinReq, err := s.hackRepo.GetRequest(ctx, requestId)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to get join request %w", err)
	}

	if participant.TeamId != joinReq.TeamId {
		return fmt.Errorf("mismatch participant and join.part_id")
	}

	if joinReq.CaptainId != participant.Id {
		return ErrOnlyCaptainCanAcceptRequests
	}

	err = s.hackRepo.AcceptRequest(ctx, requestId, joinReq.TeamId, joinReq.ParticipantId)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to accept join request %w", err)
	}

	return nil
}

func (s *ServiceImpl) CreateHack(ctx context.Context, hack *repo.HackathonGeneralDTO) (int, error) {
	hackId, err := s.hackRepo.CreateHack(ctx, hack)

	fmt.Println(hack)
	if err != nil {
		fmt.Println(err)
		return -1, err
	}
	return hackId, nil
}

func (s *ServiceImpl) GetParticipantProfile(ctx context.Context, hackId int, participantId int) (*repo.Participant, error) {
	participant, err := s.hackRepo.GetParticipantProfile(ctx, participantId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("get participant profile: %w", err)
	}
	if participant.HackId != hackId {
		return nil, ErrHackNotFound
	}
	return s.hackRepo.GetParticipantProfile(ctx, participantId)
}

func NewServiceImpl(formRepo repo.Form, authRepo repo.Auth, hackRepo repo.Hackathon, userRepo repo.User) *ServiceImpl {
	return &ServiceImpl{
		formRepo: formRepo,
		authRepo: authRepo,
		hackRepo: hackRepo,
		userRepo: userRepo,
	}
}

func (s *ServiceImpl) LoginUser(ctx context.Context, code string, secret string) (string, string, error) {
	authDTO, err := s.authRepo.Read(ctx, code)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, repo.ErrAuthCodeNotFound) {
			return "", "", ErrAuthCodeNotFound
		}
		return "", "", fmt.Errorf("failed to read auth code: %w", err)
	}
	userDto := &repo.UserDTO{
		ID:        authDTO.TelegramId,
		FirstName: authDTO.FirstName,
		LastName:  authDTO.LastName,
		IsAdmin:   false,
	}

	_, err = s.userRepo.Read(ctx, userDto.ID)
	if errors.Is(err, repo.ErrUserNotFound) {
		fmt.Println("New user login. Must create one")
		errCreate := s.userRepo.Create(ctx, userDto)
		if errCreate != nil {
			return "", "", fmt.Errorf("failed to create user: %w", errCreate)
		}
	} else if err != nil {
		return "", "", fmt.Errorf("failed to read user: %w", err)
	}

	accessToken, err := jwt.NewToken(userDto, time.Hour, secret)
	if err != nil {
		fmt.Println(err)
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := jwt.NewRefreshToken(userDto, secret)
	if err != nil {
		fmt.Println(err)
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	return accessToken, refreshToken, nil
}

func (s *ServiceImpl) LoginAdmin(ctx context.Context, login string, password string, secret string) (string, string, error) {
	userDto, err := s.userRepo.ReadAdmin(ctx, login)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, repo.ErrUserNotFound) {
			return "", "", ErrInvalidCredentials
		}
		return "", "", fmt.Errorf("failed to read user: %w", err)
	}

	if ok, err := jwt.ComparePassword(password, userDto.PassHash); !ok || err != nil {
		return "", "", fmt.Errorf("Failed to login admin: %w", ErrInvalidCredentials)
	}

	accessToken, err := jwt.NewToken(userDto, time.Hour, secret)
	if err != nil {
		fmt.Println(err)
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}
	refreshToken, err := jwt.NewRefreshToken(userDto, secret)
	if err != nil {
		fmt.Println(err)
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	return accessToken, refreshToken, nil
}

func (s *ServiceImpl) ListHacks(ctx context.Context) ([]*repo.HackathonGeneralDTO, error) {
	return s.hackRepo.List(ctx)
}

func (s *ServiceImpl) GetHack(ctx context.Context, hackId int) (*repo.HackathonGeneralDTO, error) {
	hack, err := s.hackRepo.Read(ctx, hackId)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, repo.ErrHackathonNotFound) {
			return nil, ErrHackNotFound
		}
		return nil, fmt.Errorf("failed to read hack: %w", err)
	}
	return hack, nil
}

func (s *ServiceImpl) EnterHackathon(ctx context.Context, create repo.FormCreate) error {
	_, err := s.hackRepo.GetParticipant(ctx, create.HackId, create.UserId)
	if err == nil {
		fmt.Println("user already joined hackathon")
		return ErrUserAlreadyJoinedHackathon
	}
	if !errors.Is(err, repo.ErrParticipantNotFound) {
		fmt.Println(err)
		if errors.Is(err, repo.ErrHackathonNotFound) {
			return ErrHackNotFound
		}
		return fmt.Errorf("failed to read participant: %w", err)
	}
	err = s.hackRepo.AddParticipant(ctx, create.HackId, create)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to add participant: %w", err)
	}
	return nil
}

func (s *ServiceImpl) ListParticipants(ctx context.Context, hackId int) ([]*repo.Participant, error) {
	return s.hackRepo.ListParticipants(ctx, hackId)
}

func (s *ServiceImpl) ListHackTeams(ctx context.Context, hackId int) ([]*repo.TeamShort, error) {
	return s.hackRepo.ListTeams(ctx, hackId)
}

func (s *ServiceImpl) GetTeam(ctx context.Context, hackId int, teamId int) (*repo.TeamShort, error) {
	team, err := s.hackRepo.GetTeamProfile(ctx, teamId)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to get team profile: %w", err)
	}

	if team.HackId != hackId {
		fmt.Println("hack id does not match")
		return nil, ErrHackNotFound
	}

	return team, nil
}

func (s *ServiceImpl) CreateTeam(ctx context.Context, userId int64, hackId int, name string) error {
	//TODO implement me
	participant, err := s.hackRepo.GetParticipant(ctx, hackId, userId)
	if err != nil {
		fmt.Println(err)
		if errors.Is(err, repo.ErrParticipantNotFound) {
			return ErrHackNotFound
		}
		return fmt.Errorf("failed to read participant: %w", err)
	}

	if participant.TeamId != TeamNull {
		return ErrUserAlreadyJoinedTeam
	}

	err = s.hackRepo.CreateTeam(ctx, participant.Id, hackId, name)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to create hack team: %w", err)
	}

	return nil
}

func (s *ServiceImpl) ListSkills(ctx context.Context) ([]*repo.Skill, error) {
	return s.formRepo.ListSkills(ctx)
}

func (s *ServiceImpl) ListRoles(ctx context.Context) ([]*repo.Role, error) {
	return s.formRepo.ListRoles(ctx)
}
