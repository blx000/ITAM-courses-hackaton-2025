package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/blx000/ITAM-courses-hackaton-2025/internal/port/repo"
	"github.com/blx000/ITAM-courses-hackaton-2025/pkg/jwt"
	"time"
)

var (
	ErrHackNotFound               = errors.New("hack not found")
	ErrAuthCodeNotFound           = errors.New("auth code not found")
	ErrUserAlreadyJoinedHackathon = errors.New("user already joined hackathon")
	ErrUserNotFound               = errors.New("user not found")
	ErrInvalidCredentials         = errors.New("invalid credentials")
)

type Service interface {
	LoginUser(ctx context.Context, code string, secret string) (string, string, error)
	LoginAdmin(ctx context.Context, login string, password string, secret string) (string, string, error)

	ListSkills(ctx context.Context) ([]*repo.Skill, error)
	ListRoles(ctx context.Context) ([]*repo.Role, error)

	ListHacks(ctx context.Context) ([]*repo.HackathonGeneralDTO, error)
	GetHack(ctx context.Context, hackId int) (*repo.HackathonGeneralDTO, error)
	EnterHackathon(ctx context.Context, create repo.FormCreate) error
	ListParticipants(ctx context.Context, hackId int) ([]*repo.Participant, error)
	ListHackTeams(ctx context.Context, hackId int) ([]*repo.TeamShort, error)
	GetTeam(ctx context.Context, teamId int) (*repo.TeamShort, error)
	CreateTeam(ctx context.Context, userId int64, hackId int, name string) error
}

type ServiceImpl struct {
	formRepo repo.Form
	authRepo repo.Auth
	hackRepo repo.Hackathon
	userRepo repo.User
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
		fmt.Println("hack already joined hackathon")
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
	//TODO implement me
	panic("implement me")
}

func (s *ServiceImpl) ListHackTeams(ctx context.Context, hackId int) ([]*repo.TeamShort, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ServiceImpl) GetTeam(ctx context.Context, teamId int) (*repo.TeamShort, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ServiceImpl) CreateTeam(ctx context.Context, userId int64, hackId int, name string) error {
	//TODO implement me
	panic("implement me")
}

func (s *ServiceImpl) ListSkills(ctx context.Context) ([]*repo.Skill, error) {
	return s.formRepo.ListSkills(ctx)
}

func (s *ServiceImpl) ListRoles(ctx context.Context) ([]*repo.Role, error) {
	return s.formRepo.ListRoles(ctx)
}
