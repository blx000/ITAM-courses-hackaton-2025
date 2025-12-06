import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import type { Participant } from "../../../api";
import styles from "./participant-profile-page.module.css";
import bgImage from "/bg-image.png";

export function ParticipantProfilePage() {
  const { id, participantId } = useParams<{ id: string; participantId: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

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
      
      const participantData = await HackmateApi.getParticipant(hackathonId, partId);
      setParticipant(participantData);
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
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Назад
        </button>

        <div className={styles.profileHeader}>
          <div className={styles.profilePhoto}>
            {participant.first_name?.[0]}{participant.last_name?.[0]}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.name}>
              {participant.first_name} {participant.last_name}
            </h1>
            <div className={styles.role}>
              {participant.role.name}
            </div>
            {participant.team_id ? (
              <span className={styles.teamBadge}>В команде</span>
            ) : (
              <span className={styles.freeBadge}>Свободен</span>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Стек:</h2>
          <div className={styles.skillsList}>
            {participant.skills && participant.skills.length > 0 ? (
              participant.skills.map((skill) => (
                <div key={skill.id} className={styles.skillTag}>
                  {skill.name}
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>Навыки не указаны</p>
            )}
          </div>
        </div>

        {!participant.team_id && (
          <button 
            className={styles.inviteButton}
            onClick={handleInvite}
            disabled={inviting}
          >
            {inviting ? "Отправка..." : "Пригласить в команду"}
          </button>
        )}
      </div>
    </div>
  );
}




