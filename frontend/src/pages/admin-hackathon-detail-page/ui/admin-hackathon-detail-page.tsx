import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { HackmateApi } from "../../../api";
import type { HackathonPage, Participant, Team, Role } from "../../../api";
import styles from "./admin-hackathon-detail-page.module.css";
import bgImage from "/admin-bg2.png";
import bgImageParticipants from "/admin-bg3.png";
import bgImageAnalytics from "/admin-bg4.png";
import profileIcon from "/profile-icon.svg";
import teamIcon from "/team-icon.svg";
import hackathonIcon from "/hackathon-photo.svg";
import adminIcon from "/admin-icon.svg";
import searchIcon from "/search-icon.svg";
import sortIcon from "/sort-icon.svg";

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
  const [participantSearchQuery, setParticipantSearchQuery] = useState("");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [selectedTeamRoleIds, setSelectedTeamRoleIds] = useState<number[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showTeamRoleDropdown, setShowTeamRoleDropdown] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const teamRoleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      setError("ID хакатона не указан");
      setLoading(false);
      return;
    }
    loadData();
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setShowRoleDropdown(false);
      }
      if (
        teamRoleDropdownRef.current &&
        !teamRoleDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTeamRoleDropdown(false);
      }
    };

    if (showRoleDropdown || showTeamRoleDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoleDropdown, showTeamRoleDropdown]);

  const loadRoles = async () => {
    try {
      const rolesData = await HackmateApi.getRoles();
      // Sort roles alphabetically by name
      const sortedRoles = [...rolesData].sort((a, b) =>
        a.name.localeCompare(b.name, "ru")
      );
      setRoles(sortedRoles);
    } catch (err) {
      console.error("Ошибка загрузки ролей:", err);
    }
  };

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

  const filteredParticipants = participants.filter((participant) => {
    // Filter by search query
    const matchesSearch =
      !participantSearchQuery.trim() ||
      (() => {
        const searchLower = participantSearchQuery.toLowerCase();
        const fullName =
          `${participant.first_name} ${participant.last_name}`.toLowerCase();
        const roleName = (participant.role?.name || "").toLowerCase();
        const skillsText = (participant.skills || [])
          .map((s) => s.name.toLowerCase())
          .join(" ");
        return (
          fullName.includes(searchLower) ||
          roleName.includes(searchLower) ||
          skillsText.includes(searchLower)
        );
      })();

    // Filter by selected roles (multiple selection)
    const matchesRole =
      selectedRoleIds.length === 0 || (participant.role && selectedRoleIds.includes(participant.role.id));

    return matchesSearch && matchesRole;
  });

  const handleSortClick = () => {
    setShowRoleDropdown(!showRoleDropdown);
  };

  const handleTeamSortClick = () => {
    setShowTeamRoleDropdown(!showTeamRoleDropdown);
  };

  const handleRoleToggle = (roleId: number) => {
    const newSelectedIds = selectedRoleIds.includes(roleId)
      ? selectedRoleIds.filter((id) => id !== roleId)
      : [...selectedRoleIds, roleId];
    setSelectedRoleIds(newSelectedIds);
  };

  const handleClearAllRoles = () => {
    setSelectedRoleIds([]);
  };

  const handleTeamRoleToggle = (roleId: number) => {
    const newSelectedIds = selectedTeamRoleIds.includes(roleId)
      ? selectedTeamRoleIds.filter((id) => id !== roleId)
      : [...selectedTeamRoleIds, roleId];
    setSelectedTeamRoleIds(newSelectedIds);
  };

  const handleClearAllTeamRoles = () => {
    setSelectedTeamRoleIds([]);
  };

  const filteredTeams = teams.filter((team) => {
    // Filter by search query
    const matchesSearch =
      !teamSearchQuery.trim() ||
      (() => {
        const searchLower = teamSearchQuery.toLowerCase();
        const teamName = team.name.toLowerCase();
        const rolesText = (team.needed_roles || [])
          .map((r) => r.name.toLowerCase())
          .join(" ");
        return teamName.includes(searchLower) || rolesText.includes(searchLower);
      })();

    // Filter by selected roles (teams that need any of these roles)
    const matchesRole =
      selectedTeamRoleIds.length === 0 ||
      (team.needed_roles || []).some((role) => selectedTeamRoleIds.includes(role.id));

    return matchesSearch && matchesRole;
  });

  const analytics = {
    totalParticipants: participants.length,
    participantsWithTeam: participants.filter((p) => p.team_id > 0).length,
    participantsWithoutTeam: participants.filter((p) => p.team_id <= 0).length,
    totalTeams: teams.length,
    averageTeamSize:
      teams.length > 0
        ? (
            teams.reduce(
              (sum, team) => sum + (team.cur_size || team.members.length),
              0
            ) / teams.length
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

  const getBackgroundImage = () => {
    if (activeTab === "participants" || activeTab === "teams") {
      return bgImageParticipants;
    }
    if (activeTab === "analytics") {
      return bgImageAnalytics;
    }
    return bgImage;
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={getBackgroundImage()} alt="background" />
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
            className={`${styles.tab} ${
              activeTab === "info" ? styles.tabActive : ""
            }`}
            onClick={() => {
              setActiveTab("info");
              setSelectedRoleIds([]);
              setSelectedTeamRoleIds([]);
            }}
          >
            Информация
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "participants" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("participants")}
          >
            Участники
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "teams" ? styles.tabActive : ""
            }`}
            onClick={() => {
              setActiveTab("teams");
              setSelectedRoleIds([]);
              setSelectedTeamRoleIds([]);
            }}
          >
            Команды
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "analytics" ? styles.tabActive : ""
            }`}
            onClick={() => {
              setActiveTab("analytics");
              setSelectedRoleIds([]);
              setSelectedTeamRoleIds([]);
            }}
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
                      {new Intl.NumberFormat("ru-RU").format(
                        hackathon.prize || 0
                      )}{" "}
                      ₽
                    </span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>Дата проведения:</span>
                    <span className={styles.infoValue}>
                      {new Date(hackathon.start_date).toLocaleDateString(
                        "ru-RU",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(hackathon.end_date).toLocaleDateString(
                        "ru-RU",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className={styles.infoField}>
                    <span className={styles.infoLabel}>
                      Максимальный размер команды:
                    </span>
                    <span className={styles.infoValue}>
                      {hackathon.max_team_size}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.additionalBlock}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Дополнительная информация
                  </label>
                  <div className={styles.textarea}>{hackathon.description}</div>
                </div>
              </div>

              <div className={styles.editButtonContainer}>
                <button
                  className={styles.editButton}
                  onClick={() =>
                    navigate(`/admin/hackathons/${hackathon.id}/edit`)
                  }
                >
                  Редактировать
                </button>
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className={styles.participantsSection}>
              <div className={styles.searchBox} ref={roleDropdownRef}>
                <img
                  src={searchIcon}
                  alt="search"
                  className={styles.searchIcon}
                />
                <input
                  type="text"
                  value={participantSearchQuery}
                  onChange={(e) => setParticipantSearchQuery(e.target.value)}
                  placeholder="Поиск участника"
                  className={styles.searchInput}
                />
                <button
                  type="button"
                  onClick={handleSortClick}
                  className={styles.sortButton}
                  title={
                    selectedRoleIds.length > 0
                      ? `Выбрано ролей: ${selectedRoleIds.length}`
                      : "Фильтр по ролям"
                  }
                >
                  <img src={sortIcon} alt="sort-icon" />
                  {selectedRoleIds.length > 0 && (
                    <span className={styles.roleCount}>{selectedRoleIds.length}</span>
                  )}
                </button>
                {showRoleDropdown && (
                  <div className={styles.roleDropdown}>
                    <div className={styles.roleDropdownHeader}>
                      <span>Выбор ролей</span>
                      {selectedRoleIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllRoles}
                          className={styles.clearAllButton}
                        >
                          Очистить
                        </button>
                      )}
                    </div>
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`${styles.roleOption} ${
                          selectedRoleIds.includes(role.id) ? styles.selected : ""
                        }`}
                        onClick={() => handleRoleToggle(role.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoleIds.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          className={styles.roleCheckbox}
                        />
                        {role.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {filteredParticipants.length === 0 ? (
                <div className={styles.empty}>
                  {participants.length === 0
                    ? "Участники не найдены"
                    : "По запросу ничего не найдено"}
                </div>
              ) : (
                <div className={styles.participantsList}>
                  {filteredParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className={styles.participantCard}
                    >
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
                          {participant.skills &&
                            participant.skills.length > 0 && (
                              <div className={styles.participantSkills}>
                                {participant.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill.id}
                                    className={styles.skillTag}
                                  >
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
              <div className={styles.searchBox} ref={teamRoleDropdownRef}>
                <img
                  src={searchIcon}
                  alt="search"
                  className={styles.searchIcon}
                />
                <input
                  type="text"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  placeholder="Поиск команды"
                  className={styles.searchInput}
                />
                <button
                  type="button"
                  onClick={handleTeamSortClick}
                  className={styles.sortButton}
                  title={
                    selectedTeamRoleIds.length > 0
                      ? `Выбрано ролей: ${selectedTeamRoleIds.length}`
                      : "Фильтр по искомым ролям"
                  }
                >
                  <img src={sortIcon} alt="sort-icon" />
                  {selectedTeamRoleIds.length > 0 && (
                    <span className={styles.roleCount}>{selectedTeamRoleIds.length}</span>
                  )}
                </button>
                {showTeamRoleDropdown && (
                  <div className={styles.roleDropdown}>
                    <div className={styles.roleDropdownHeader}>
                      <span>Выбор ролей</span>
                      {selectedTeamRoleIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllTeamRoles}
                          className={styles.clearAllButton}
                        >
                          Очистить
                        </button>
                      )}
                    </div>
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`${styles.roleOption} ${
                          selectedTeamRoleIds.includes(role.id) ? styles.selected : ""
                        }`}
                        onClick={() => handleTeamRoleToggle(role.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeamRoleIds.includes(role.id)}
                          onChange={() => handleTeamRoleToggle(role.id)}
                          className={styles.roleCheckbox}
                        />
                        {role.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {filteredTeams.length === 0 ? (
                <div className={styles.empty}>
                  {teams.length === 0
                    ? "Команды не найдены"
                    : "По запросу ничего не найдено"}
                </div>
              ) : (
                <div className={styles.teamsList}>
                  {filteredTeams.map((team) => (
                    <div key={team.id} className={styles.teamCard}>
                      <div className={styles.teamContent}>
                        <div className={styles.teamIcon}>
                          <img src={teamIcon} alt="team" />
                        </div>
                        <div className={styles.teamInfo}>
                          <h3 className={styles.teamName}>{team.name}</h3>
                          <div className={styles.teamStats}>
                            Участников: {team.cur_size || team.members.length} /{" "}
                            {team.max_size}
                          </div>
                          {team.needed_roles &&
                            team.needed_roles.length > 0 && (
                              <div className={styles.neededRoles}>
                                <strong>Ищем:</strong>
                                <div className={styles.neededRolesList}>
                                  {team.needed_roles.map((role) => (
                                    <span
                                      key={role.id}
                                      className={styles.roleTag}
                                    >
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
                  <div className={styles.analyticsValue}>
                    {analytics.totalParticipants}
                  </div>
                  <div className={styles.analyticsLabel}>Всего участников</div>
                </div>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>
                    {analytics.participantsWithTeam}
                  </div>
                  <div className={styles.analyticsLabel}>С командой</div>
                </div>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>
                    {analytics.participantsWithoutTeam}
                  </div>
                  <div className={styles.analyticsLabel}>Без команды</div>
                </div>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>
                    {analytics.averageTeamSize}
                  </div>
                  <div className={styles.analyticsLabel}>
                    Средний размер команды
                  </div>
                </div>
                <div className={styles.analyticsCard}>
                  <div className={styles.analyticsValue}>
                    {analytics.totalTeams}
                  </div>
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
