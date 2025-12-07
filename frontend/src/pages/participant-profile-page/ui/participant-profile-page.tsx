import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { Participant } from "../../../api";
import { ProfileHeader } from "../../../modules/profile-header";
import { Navigation } from "../../../modules/navigation";
import styles from "./participant-profile-page.module.css";
import bgImage from "/bg-image3.png";
import profilePhoto from "/profile-photo.svg";

export function ParticipantProfilePage() {
  const { id, participantId } = useParams<{
    id: string;
    participantId: string;
  }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

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

      const participantData = await HackmateApi.getParticipant(
        hackathonId,
        partId
      );
      setParticipant(participantData);
      
      // Проверяем, является ли это текущий пользователь
      const userId = AuthService.getUserId();
      if (userId && participantData.id === userId) {
        setIsCurrentUser(true);
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
      alert("Приглашение отправлено!");
    } catch (err: any) {
      console.error("Ошибка отправки приглашения:", err);
      setError(
        err.response?.data?.message ||
          "Не удалось отправить приглашение. Пожалуйста, попробуйте позже."
      );
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

        {participant.team_id && participant.team_id > 0 ? (
          <div className={styles.teamBadgeContainer}>
            <span className={styles.teamBadge}>В команде</span>
          </div>
        ) : (
          <div className={styles.freeBadgeContainer}>
            <span className={styles.freeBadge}>Свободен</span>
          </div>
        )}

        {!participant.team_id && !isCurrentUser && (
          <button
            className={styles.inviteButton}
            onClick={handleInvite}
            disabled={inviting}
          >
            {inviting ? "Отправка..." : "Пригласить в команду"}
          </button>
        )}
      </div>
      <Navigation />
    </div>
  );
}
