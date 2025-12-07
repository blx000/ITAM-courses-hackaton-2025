import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { HackmateApi } from "../../../api";
import type { HackathonPage, Participant, Team } from "../../../api";
import styles from "./admin-hackathon-detail-page.module.css";
import bgImage from "/admin-bg1.png";
import profileIcon from "/profile-icon.svg";
import teamIcon from "/team-icon.svg";
import hackathonIcon from "/hackathon-photo.svg";
import adminIcon from "/admin-icon.svg";

type Tab = "info" | "participants" | "teams" | "analytics";

export function AdminHackathonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [hackathon, setHackathon] = useState<HackathonPage | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID хакатона не указан");
      setLoading(false);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.search]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const hackathonId = parseInt(id);

      const [hackathonData, participantsData, teamsData] = await Promise.all([
        HackmateApi.getHackathon(hackathonId),
        HackmateApi.getHackathonParticipants(hackathonId),
        HackmateApi.getHackathonTeams(hackathonId),
      ]);

      setHackathon(hackathonData);
      setParticipants(participantsData);
      setTeams(teamsData);
    } catch (err: any) {
      console.error("Error loading hackathon data:", err);
      setError("Не удалось загрузить данные хакатона");
    } finally {
      setLoading(false);
    }
  };

  const analytics = {
    totalParticipants: participants.length,
    participantsWithTeam: participants.filter((p) => p.team_id > 0).length,
    participantsWithoutTeam: participants.filter((p) => p.team_id <= 0).length,
    totalTeams: teams.length,
    averageTeamSize:
      teams.length > 0
        ? (
            teams.reduce((sum, team) => sum + (team.cur_size || team.members.length), 0) /
            teams.length
          ).toFixed(1)
        : "0",
    roleStats: participants.reduce((acc, p) => {
      const roleName = p.role?.name || "Не указано";
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || "Хакатон не найден"}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img
            src={adminIcon}
            alt="Admin"
            className={styles.adminIcon}
            onClick={() => navigate("/admin")}
            style={{ cursor: "pointer" }}
          />
          <span className={styles.adminText}>
            Hack <span>Mate</span> admin
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "info" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Информация
          </button>
          <button
            className={`${styles.tab} ${activeTab === "participants" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("participants")}
          >
            Участники
          </button>
          <button
            className={`${styles.tab} ${activeTab === "teams" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("teams")}
          >
            Команды
          </button>
          <button
            className={`${styles.tab} ${activeTab === "analytics" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Аналитика
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "info" && (
            <div className={styles.infoSection}>
              <div className={styles.mainBlock}>
                <div className={styles.iconContainer}>
                  <img
                    src={hackathonIcon}
                    alt="hackathon"
                    className={styles.hackathonIcon}
                  />
                </div>
                <div className={styles.infoFields}>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Название:</span>
                    <span className={styles.infoValue}>{hackathon.name}</span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Призовой фонд:</span>
                    <span className={styles.infoValue}>
                      {new Intl.NumberFormat("ru-RU").format(hackathon.prize || 0)} ₽
                    </span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Дата проведения:</span>
                    <span className={styles.infoValue}>
                      {new Date(hackathon.start_date).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(hackathon.end_date).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Максимальный размер команды:</span>
                    <span className={styles.infoValue}>{hackathon.max_team_size}</span>
                  </div>
                </div>
              </div>

              <div className={styles.additionalBlock}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Дополнительная информация</label>
                  <div className={styles.textarea}>{hackathon.description}</div>
                </div>
              </div>

              <div className={styles.editButtonContainer}>
                <button
                  className={styles.editButton}
                  onClick={() => navigate(`/admin/hackathons/${hackathon.id}/edit`)}
                >
                  Редактировать
                </button>
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className={styles.participantsSection}>
              {participants.length === 0 ? (
                <div className={styles.empty}>Участники не найдены</div>
              ) : (
                <div className={styles.participantsList}>
                  {participants.map((participant) => (
                    <div key={participant.id} className={styles.participantCard}>
                      <div className={styles.participantContent}>
                        <div className={styles.participantIcon}>
                          <img src={profileIcon} alt="profile" />
                        </div>
                        <div className={styles.participantInfo}>
                          <h3 className={styles.participantName}>
                            {participant.first_name} {participant.last_name}
                          </h3>
                          <div className={styles.participantRole}>
                            {participant.role?.name || "Не указано"}
                          </div>
                          {participant.skills && participant.skills.length > 0 && (
                            <div className={styles.participantSkills}>
                              {participant.skills.slice(0, 3).map((skill) => (
                                <span key={skill.id} className={styles.skillTag}>
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {participant.team_id > 0 ? (
                        <span className={styles.teamBadge}>В команде</span>
                      ) : (
                        <span className={styles.freeBadge}>Свободен</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "teams" && (
            <div className={styles.teamsSection}>
              {teams.length === 0 ? (
                <div className={styles.empty}>Команды не найдены</div>
              ) : (
                <div className={styles.teamsList}>
                  {teams.map((team) => (
                    <div key={team.id} className={styles.teamCard}>
                      <div className={styles.teamContent}>
                        <div className={styles.teamIcon}>
                          <img src={teamIcon} alt="team" />
                        </div>
                        <div className={styles.teamInfo}>
                          <h3 className={styles.teamName}>{team.name}</h3>
                          <div className={styles.teamStats}>
                            Участников: {team.cur_size || team.members.length} / {team.max_size}
                          </div>
                          {team.needed_roles && team.needed_roles.length > 0 && (
                            <div className={styles.neededRoles}>
                              <strong>Ищем:</strong>
                              <div className={styles.neededRolesList}>
                                {team.needed_roles.map((role) => (
                                  <span key={role.id} className={styles.roleTag}>
                                    {role.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.analyticsSection}>
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>{analytics.totalParticipants}</div>
                  <div className={styles.analyticsLabel}>Всего участников</div>
                </div>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>{analytics.participantsWithTeam}</div>
                  <div className={styles.analyticsLabel}>С командой</div>
                </div>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>{analytics.participantsWithoutTeam}</div>
                  <div className={styles.analyticsLabel}>Без команды</div>
                </div>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>{analytics.averageTeamSize}</div>
                  <div className={styles.analyticsLabel}>Средний размер команды</div>
                </div>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>{analytics.totalTeams}</div>
                  <div className={styles.analyticsLabel}>Всего команд</div>
                </div>
              </div>

              <div className={styles.roleStatsCard}>
                <h3 className={styles.roleStatsTitle}>Популярные роли</h3>
                <div className={styles.roleStatsList}>
                  {Object.entries(analytics.roleStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([role, count]) => (
                      <div key={role} className={styles.roleStatItem}>
                        <span className={styles.roleStatName}>{role}</span>
                        <span className={styles.roleStatCount}>{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
