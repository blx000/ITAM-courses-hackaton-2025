import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { Team } from "../../../api";
import styles from "./team-profile-page.module.css";
import bgImage from "/bg-image.png";

export function TeamProfilePage() {
  const { id, teamId } = useParams<{ id: string; teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCaptain, setIsCaptain] = useState(false);

  useEffect(() => {
    if (!id || !teamId) {
      setError("ID хакатона или команды не указан");
      setLoading(false);
      return;
    }

    loadTeam();
  }, [id, teamId]);

  const loadTeam = async () => {
    if (!id || !teamId) return;

    try {
      setLoading(true);
      setError(null);
      const hackathonId = parseInt(id);
      const tId = parseInt(teamId);
      
      const teamData = await HackmateApi.getTeam(hackathonId, tId);
      setTeam(teamData);
      
      // Check if current user is captain
      const userId = AuthService.getUserId();
      if (userId && teamData.captain_id === userId) {
        setIsCaptain(true);
      }
    } catch (err: any) {
      console.error("Ошибка загрузки команды:", err);
      setError(
        err.response?.data?.message ||
        "Не удалось загрузить информацию о команде. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async () => {
    if (!id || !teamId) return;

    try {
      await HackmateApi.requestToJoinTeam(parseInt(id), parseInt(teamId));
      alert("Заявка отправлена!");
    } catch (err: any) {
      console.error("Ошибка отправки заявки:", err);
      alert(err.response?.data?.message || "Не удалось отправить заявку");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || "Команда не найдена"}</div>
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

        <h1 className={styles.teamName}>{team.name}</h1>
        <div className={styles.teamInfo}>
          <p className={styles.membersCount}>
            Участников: {team.members.length} / {team.max_size}
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Участники команды:</h2>
          <div className={styles.membersList}>
            {team.members.map((member) => (
              <div
                key={member.id}
                className={styles.memberCard}
                onClick={() => navigate(`/hackathons/${id}/participants/${member.id}`)}
              >
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>
                    {member.first_name} {member.last_name}
                  </h3>
                  {member.id === team.captain_id && (
                    <span className={styles.captainBadge}>Капитан</span>
                  )}
                </div>
                <div className={styles.memberRole}>{member.role.name}</div>
                <div className={styles.memberSkills}>
                  {member.skills && member.skills.length > 0 && (
                    <>
                      {member.skills.slice(0, 3).map((skill) => (
                        <span key={skill.id} className={styles.skillTag}>
                          {skill.name}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className={styles.moreSkills}>
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isCaptain && team.members.length < team.max_size && (
          <button
            className={styles.requestButton}
            onClick={handleRequestJoin}
          >
            Подать заявку
          </button>
        )}
      </div>
    </div>
  );
}




