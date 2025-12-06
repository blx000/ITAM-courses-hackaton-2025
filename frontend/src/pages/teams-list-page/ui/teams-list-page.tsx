import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { Team } from "../../../api";
import styles from "./teams-list-page.module.css";
import bgImage from "/bg-image.png";

export function TeamsListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID хакатона не указан");
      setLoading(false);
      return;
    }

    loadTeams();
  }, [id]);

  const loadTeams = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const hackathonId = parseInt(id);
      
      const teamsData = await HackmateApi.getHackathonTeams(hackathonId);
      setTeams(teamsData);
      
      const userId = AuthService.getUserId();
      if (userId) {
        const userTeam = teamsData.find(
          (team) => team.captain_id === userId || 
          team.members.some((m) => m.id === userId)
        );
        if (userTeam) {
          setMyTeam(userTeam);
        }
      }
    } catch (err: any) {
      console.error("Ошибка загрузки команд:", err);
      setError(
        err.response?.data?.message ||
        "Не удалось загрузить команды. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
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

        <h1 className={styles.title}>Команды</h1>

        {error && <div className={styles.error}>{error}</div>}

        {myTeam && (
          <div className={styles.myTeamSection}>
            <h2 className={styles.sectionTitle}>Моя команда</h2>
            <div
              className={styles.teamCard}
              onClick={() => navigate(`/hackathons/${id}/teams/${myTeam.id}`)}
            >
              <h3 className={styles.teamName}>{myTeam.name}</h3>
              <div className={styles.teamInfo}>
                <p className={styles.membersCount}>
                  Участников: {myTeam.members.length} / {myTeam.max_size}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.allTeamsSection}>
          <h2 className={styles.sectionTitle}>
            {myTeam ? "Другие команды" : "Все команды"}
          </h2>
          
          {!myTeam && (
            <button
              className={styles.createButton}
              onClick={() => navigate(`/hackathons/${id}/teams/create`)}
            >
              Создать команду
            </button>
          )}

          {teams.length === 0 ? (
            <div className={styles.empty}>Команды не найдены</div>
          ) : (
            <div className={styles.teamsList}>
              {teams
                .filter((team) => !myTeam || team.id !== myTeam.id)
                .map((team) => (
                  <div
                    key={team.id}
                    className={styles.teamCard}
                    onClick={() => navigate(`/hackathons/${id}/teams/${team.id}`)}
                  >
                    <h3 className={styles.teamName}>{team.name}</h3>
                    <div className={styles.teamInfo}>
                      <p className={styles.membersCount}>
                        Участников: {team.members.length} / {team.max_size}
                      </p>
                      {team.members.length < team.max_size && (
                        <span className={styles.openBadge}>Открыт набор</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




