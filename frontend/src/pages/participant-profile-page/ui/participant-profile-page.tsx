import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { Participant } from "../../../api";
import { ProfileHeader } from "../../../modules/profile-header";
import { Navigation } from "../../../modules/navigation";
import { Toast } from "../../../shared/components/toast";
import styles from "./participant-profile-page.module.css";
import bgImage from "/bg-image3.png";
import profilePhoto from "/profile-photo.svg";

export function ParticipantProfilePage() {
  const { id, participantId } = useParams<{
    id: string;
    participantId: string;
  }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [participantUsername, setParticipantUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isCaptain, setIsCaptain] = useState(false);
  const [userTeamId, setUserTeamId] = useState<number | null>(null);
  const [hasInvitation, setHasInvitation] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!id || !participantId) {
      setError("ID хакатона или участника не указан");
      setLoading(false);
      return;
    }

    loadParticipant();
  }, [id, participantId]);

  const loadParticipant = async () => {
    if (!id || !participantId) return;

    try {
      setLoading(true);
      setError(null);
      const hackathonId = parseInt(id);
      const partId = parseInt(participantId);

      const [participantData, currentUser] = await Promise.all([
        HackmateApi.getParticipant(hackathonId, partId),
        AuthService.isAuthenticated()
          ? HackmateApi.getCurrentUser()
          : Promise.resolve(null),
      ]);

      setParticipant(participantData);

      try {
        const userData = await HackmateApi.getUser(participantData.id);
        setParticipantUsername(userData.username || userData.login || null);
      } catch (err) {
        console.error("Ошибка загрузки username участника:", err);
      }

      const userId = AuthService.getUserId();
      if (userId && participantData.id === userId) {
        setIsCurrentUser(true);
      }

      if (currentUser && userId) {
        try {
          const participants = await HackmateApi.getHackathonParticipants(
            hackathonId
          );
          const userParticipant = participants.find(
            (p: Participant) =>
              p.first_name === currentUser.first_name &&
              p.last_name === currentUser.last_name
          );

          if (
            userParticipant &&
            userParticipant.team_id &&
            userParticipant.team_id > 0
          ) {
            setUserTeamId(userParticipant.team_id);
            const team = await HackmateApi.getTeam(
              hackathonId,
              userParticipant.team_id
            );
            if (team.captain_id === userParticipant.id) {
              setIsCaptain(true);

              try {
                const invitations = await HackmateApi.getInvitations(
                  hackathonId
                );
                const hasInvite = invitations.some(
                  (inv) =>
                    inv.participant_id === participantData.id &&
                    inv.team_id === userParticipant.team_id
                );
                setHasInvitation(hasInvite);
              } catch (err) {
                console.error("Ошибка проверки приглашений:", err);
              }
            }
          }
        } catch (err) {
          console.error("Ошибка проверки капитана:", err);
        }
      }
    } catch (err: any) {
      console.error("Ошибка загрузки участника:", err);
      setError(
        err.response?.data?.message ||
          "Не удалось загрузить профиль участника. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!id || !participantId || !participant) return;

    try {
      setInviting(true);
      setError(null);
      const hackathonId = parseInt(id);
      const partId = parseInt(participantId);

      await HackmateApi.inviteParticipant(hackathonId, partId);
      setToast({ message: "Приглашение успешно отправлено!", type: "success" });
      setHasInvitation(true);
      
      // Обновляем список приглашений после отправки
      if (isCaptain && userTeamId) {
        try {
          const invitations = await HackmateApi.getInvitations(hackathonId);
          const hasInvite = invitations.some(
            (inv) =>
              inv.participant_id === partId &&
              inv.team_id === userTeamId
          );
          setHasInvitation(hasInvite);
        } catch (err) {
          console.error("Ошибка обновления приглашений:", err);
        }
      }
      
      loadParticipant();
    } catch (err: any) {
      console.error("Ошибка отправки приглашения:", err);
      let errorMessage =
        "Не удалось отправить приглашение. Пожалуйста, попробуйте позже.";

      if (err.response?.status === 403) {
        if (
          err.response?.data?.message?.includes("without team") ||
          err.response?.data?.message?.includes("captain")
        ) {
          errorMessage = "Только капитан команды может приглашать участников";
        } else if (err.response?.data?.message?.includes("already joined")) {
          errorMessage = "Участник уже состоит в команде";
        } else {
          errorMessage = "Недостаточно прав для отправки приглашения";
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || "Участник не найден"}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProfileHeader
        title={`${participant.first_name} ${participant.last_name}`}
      />
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.content}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.info}>
          <div className={styles.photo}>
            <img src={profilePhoto} alt="profile" />
          </div>
          <div className={styles.textBox}>
            <h2 className={styles.surname}>{participant.last_name}</h2>
            <h2 className={styles.name}>{participant.first_name}</h2>
            {participantUsername && (
              <div className={styles.username}>
                @{participantUsername}
              </div>
            )}
            {participant.experience !== undefined &&
              participant.experience !== null && (
                <div className={styles.experience}>
                  {`${participant.experience} ${
                    participant.experience === 1
                      ? "хакатон"
                      : participant.experience < 5
                      ? "хакатона"
                      : "хакатонов"
                  }`}
                </div>
              )}
            <div className={styles.role}>
              {participant.role?.name || "Не указано"}
            </div>
          </div>
        </div>

        {participant.skills && participant.skills.length > 0 && (
          <div className={styles.addBox}>
            <h2 className={styles.skillsTitle}>Стек:</h2>
            <div className={styles.skillsList}>
              {participant.skills.map((skill) => (
                <span key={skill.id} className={styles.skillTag}>
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {participant.add_info && (
          <div className={styles.addBox}>
            <h2>Дополнительная информация:</h2>
            <div className={styles.text}>{participant.add_info}</div>
          </div>
        )}

        {(!participant.team_id || participant.team_id <= 0) &&
          !isCurrentUser &&
          isCaptain &&
          userTeamId &&
          userTeamId > 0 &&
          (hasInvitation ? (
            <div className={styles.invitationSent}>
              Приглашение уже отправлено
            </div>
          ) : (
            <button
              className={styles.inviteButton}
              onClick={handleInvite}
              disabled={inviting}
            >
              {inviting ? "Отправка..." : "Пригласить в команду"}
            </button>
          ))}
      </div>
      <Navigation />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
