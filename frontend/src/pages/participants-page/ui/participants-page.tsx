import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import type { Participant, Team, HackathonPage, User } from "../../../api";
import { Navigation } from "../../../modules/navigation";
import { ParticipantSearch } from "../../../modules/participant-search";
import { ParticipantsHeader } from "../../../modules/participants-header";
import styles from "./participants-page.module.css";
import bgImage from "/bg-image.png";
import addIcon from "/add-icon.svg";

export function ParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [hackathon, setHackathon] = useState<HackathonPage | null>(null);
  const [, setCurrentUser] = useState<User | null>(null);
  const [userParticipant, setUserParticipant] = useState<Participant | null>(
    null
  );
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "participants" | "teams" | "create"
  >("participants");
  const [searchQuery, setSearchQuery] = useState("");

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
      let participantsData: Participant[] = [];
      let teamsData: Team[] = [];
      let hackathonData: HackathonPage | null = null;
      let user: User | null = null;

      try {
        hackathonData = await HackmateApi.getHackathon(hackathonId);
        setHackathon(hackathonData);
      } catch (err: any) {
        console.error("Ошибка загрузки хакатона:", err);
      }

      try {
        user = await HackmateApi.getCurrentUser();
        setCurrentUser(user);
      } catch (err: any) {
        console.error("Ошибка загрузки пользователя:", err);
      }

      try {
        participantsData = await HackmateApi.getHackathonParticipants(
          hackathonId
        );
      } catch (err: any) {
        console.error("Ошибка загрузки участников:", err);
        if (err.response?.status === 401) {
          setError("Необходима авторизация. Пожалуйста, войдите в систему.");
          return;
        }
      }

      try {
        teamsData = await HackmateApi.getHackathonTeams(hackathonId);
      } catch (err: any) {
        console.error("Ошибка загрузки команд:", err);
        if (err.response?.status === 401) {
          setError("Необходима авторизация. Пожалуйста, войдите в систему.");
          return;
        }
      }

      setParticipants(participantsData);
      setTeams(teamsData);

      if (user) {
        try {
          const participant = await HackmateApi.getParticipant(
            hackathonId,
            user.id
          );
          setUserParticipant(participant);

          // Находим команду пользователя
          if (participant.team_id && participant.team_id > 0) {
            const team = teamsData.find(
              (t) =>
                t.members.some((m) => m.id === participant.id) ||
                t.id === participant.team_id
            );
            if (team) {
              setUserTeam(team);
            }
          }
        } catch (err: any) {
          setUserParticipant(null);
        }
      }

      if (participantsData.length === 0 && teamsData.length === 0) {
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      }
    } catch (err: any) {
      console.error("Ошибка загрузки данных:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Не удалось загрузить данные. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantClick = (participant: Participant) => {
    navigate(`/hackathons/${id}/participants/${participant.id}`);
  };

  const handleTeamClick = (team: Team) => {
    navigate(`/hackathons/${id}/teams/${team.id}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  const hasTeam =
    userParticipant && userParticipant.team_id && userParticipant.team_id > 0;

  const filteredParticipants = searchQuery
    ? participants.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          p.role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.skills?.some((s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : participants;

  const filteredTeams = searchQuery
    ? teams.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.members.some((m) =>
            `${m.first_name} ${m.last_name}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
      )
    : teams;

  // Сортируем участников: сначала текущий пользователь
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (userParticipant && a.id === userParticipant.id) return -1;
    if (userParticipant && b.id === userParticipant.id) return 1;
    return 0;
  });

  // Сортируем команды: сначала команда пользователя
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    if (userTeam && a.id === userTeam.id) return -1;
    if (userTeam && b.id === userTeam.id) return 1;
    return 0;
  });

  return (
    <div className={styles.container}>
      <ParticipantsHeader title={hackathon?.name || "Участники и команды"} />
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.navigation}>
          <button
            className={`${styles.navButton} ${
              activeTab === "participants" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("participants")}
          >
            Участники
          </button>
          <button
            className={`${styles.navButton} ${
              activeTab === "teams" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("teams")}
          >
            Команды
          </button>
          {!hasTeam && (
            <button
              className={`${styles.navButton} ${styles.teamBtn} ${
                activeTab === "create" ? styles.active : ""
              }`}
              onClick={() => navigate(`/hackathons/${id}/teams/create`)}
            >
              <img src={addIcon} alt="add-icon" />
            </button>
          )}
        </div>
        <div className={styles.searchContainer}>
          <ParticipantSearch
            placeholder={
              activeTab === "participants"
                ? "Поиск участников..."
                : "Поиск команд..."
            }
            onSearchChange={setSearchQuery}
          />
        </div>
        {activeTab === "participants" && (
          <div className={styles.listContainer}>
            {filteredParticipants.length === 0 ? (
              <div className={styles.empty}>
                {searchQuery ? "Участники не найдены" : "Участники не найдены"}
              </div>
            ) : (
              <div className={styles.participantsGrid}>
                {sortedParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`${styles.participantCard} ${
                      userParticipant && participant.id === userParticipant.id
                        ? styles.currentUserCard
                        : ""
                    }`}
                    onClick={() => handleParticipantClick(participant)}
                  >
                    <div className={styles.participantHeader}>
                      <h3>{`${participant.first_name} ${participant.last_name}`}</h3>
                      {participant.team_id && participant.team_id > 0 ? (
                        <span className={styles.teamBadge}>В команде</span>
                      ) : (
                        <span className={styles.freeBadge}>Свободен</span>
                      )}
                    </div>
                    <div className={styles.participantInfo}>
                      <div className={styles.role}>
                        <strong>Роль:</strong>
                        <span>{participant.role.name}</span>
                      </div>
                      {participant.skills && participant.skills.length > 0 && (
                        <div className={styles.skills}>
                          <strong>Навыки</strong>
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
          <div className={styles.listContainer}>
            {filteredTeams.length === 0 ? (
              <div className={styles.empty}>
                {searchQuery ? "Команды не найдены" : "Команды не найдены"}
              </div>
            ) : (
              <div className={styles.teamsGrid}>
                {sortedTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`${styles.teamCard} ${
                      userTeam && team.id === userTeam.id
                        ? styles.currentUserTeamCard
                        : ""
                    }`}
                    onClick={() => handleTeamClick(team)}
                  >
                    <h3 className={styles.teamName}>{team.name}</h3>
                    <div className={styles.teamInfo}>
                      <div className={styles.teamMembers}>
                        <strong>Участников:</strong> {team.members.length} /{" "}
                        {team.max_size}
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
      </div>
      <Navigation />
    </div>
  );
}
