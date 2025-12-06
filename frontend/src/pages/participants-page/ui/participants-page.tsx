import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import type { Participant, Team } from "../../../api";
import styles from "./participants-page.module.css";
import bgImage from "/bg-image.png";

export function ParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"participants" | "teams">("participants");

  useEffect(() => {
    if (!id) {
      setError("ID хакатона не указан");
      setLoading(false);
      return;
    }

    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const hackathonId = parseInt(id);
      
      const [participantsData, teamsData] = await Promise.all([
        HackmateApi.getHackathonParticipants(hackathonId),
        HackmateApi.getHackathonTeams(hackathonId),
      ]);
      
      setParticipants(participantsData);
      setTeams(teamsData);
    } catch (err: any) {
      console.error("Ошибка загрузки данных:", err);
      setError(
        err.response?.data?.message ||
        "Не удалось загрузить данные. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantClick = (participant: Participant) => {
    // Navigate to participant profile
    navigate(`/hackathons/${id}/participants/${participant.id}`);
  };

  const handleTeamClick = (team: Team) => {
    // Navigate to team profile
    navigate(`/hackathons/${id}/teams/${team.id}`);
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
      <div className={styles.content}>
        <div className={styles.header}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          ← Назад
        </button>
        <h1 className={styles.title}>Участники и команды</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "participants" ? styles.active : ""}`}
          onClick={() => setActiveTab("participants")}
        >
          Участники ({participants.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "teams" ? styles.active : ""}`}
          onClick={() => setActiveTab("teams")}
        >
          Команды ({teams.length})
        </button>
      </div>

      {activeTab === "participants" && (
        <div className={styles.content}>
          {participants.length === 0 ? (
            <div className={styles.empty}>Участники не найдены</div>
          ) : (
            <div className={styles.participantsGrid}>
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={styles.participantCard}
                  onClick={() => handleParticipantClick(participant)}
                >
                  <div className={styles.participantHeader}>
                    <h3>{`${participant.first_name} ${participant.last_name}`}</h3>
                    {participant.team_id ? (
                      <span className={styles.teamBadge}>В команде</span>
                    ) : (
                      <span className={styles.freeBadge}>Свободен</span>
                    )}
                  </div>
                  <div className={styles.participantInfo}>
                    <div className={styles.role}>
                      <strong>Роль:</strong> {participant.role.name}
                    </div>
                    {participant.skills && participant.skills.length > 0 && (
                      <div className={styles.skills}>
                        <strong>Навыки:</strong>
                        <div className={styles.skillsList}>
                          {participant.skills.map((skill) => (
                            <span key={skill.id} className={styles.skillTag}>
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "teams" && (
        <div className={styles.content}>
          {teams.length === 0 ? (
            <div className={styles.empty}>Команды не найдены</div>
          ) : (
            <div className={styles.teamsGrid}>
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={styles.teamCard}
                  onClick={() => handleTeamClick(team)}
                >
                  <h3 className={styles.teamName}>{team.name}</h3>
                  <div className={styles.teamInfo}>
                    <div className={styles.teamMembers}>
                      <strong>Участников:</strong> {team.members.length} / {team.max_size}
                    </div>
                    <div className={styles.membersList}>
                      {team.members.map((member) => (
                        <span key={member.id} className={styles.memberTag}>
                          {member.first_name} {member.last_name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === "teams" && (
        <button
          className={styles.createTeamButton}
          onClick={() => navigate(`/hackathons/${id}/teams/create`)}
        >
          Создать команду
        </button>
      )}
      </div>
    </div>
  );
}
