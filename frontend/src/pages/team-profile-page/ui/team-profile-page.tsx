import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { Team } from "../../../api";
import { ProfileHeader } from "../../../modules/profile-header";
import { Navigation } from "../../../modules/navigation";
import { Toast } from "../../../shared/components/toast";
import styles from "./team-profile-page.module.css";
import bgImage from "/bg-image3.png";
import teamPhoto from "/team-photo.svg";
import editIcon from "/edit-icon.svg";

export function TeamProfilePage() {
  const { id, teamId } = useParams<{ id: string; teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCaptain, setIsCaptain] = useState(false);
  const [userTeamId, setUserTeamId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [editingRoles, setEditingRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [hasRequested, setHasRequested] = useState(false);

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

      const [teamData, currentUser, rolesData] = await Promise.all([
        HackmateApi.getTeam(hackathonId, tId),
        AuthService.isAuthenticated()
          ? HackmateApi.getCurrentUser()
          : Promise.resolve(null),
        HackmateApi.getRoles(),
      ]);

      setTeam(teamData);
      setAvailableRoles(rolesData);

      if (teamData.needed_roles) {
        setSelectedRoles(teamData.needed_roles);
      }

      const userId = AuthService.getUserId();
      if (userId && teamData.captain_id === userId) {
        setIsCaptain(true);

        try {
          const requestsData = await HackmateApi.getTeamRequests(hackathonId);
          const teamRequests = requestsData.filter(
            (r: any) => r.team_id === teamData.id
          );
          setRequests(teamRequests);
        } catch (err) {
          console.error("Ошибка загрузки заявок:", err);
        }
      }

      if (currentUser) {
        try {
          const participants = await HackmateApi.getHackathonParticipants(
            hackathonId
          );
          const userParticipant = participants.find(
            (p) =>
              p.first_name === currentUser.first_name &&
              p.last_name === currentUser.last_name
          );

          if (
            userParticipant &&
            userParticipant.team_id &&
            userParticipant.team_id > 0
          ) {
            setUserTeamId(userParticipant.team_id);
          } else {
            try {
              const requestsData = await HackmateApi.getTeamRequests(hackathonId);
              const userRequest = requestsData.find(
                (r: any) => r.team_id === teamData.id
              );
              if (userRequest) {
                setHasRequested(true);
              }
            } catch (err) {
              console.error("Ошибка проверки заявок:", err);
            }
          }
        } catch (err) {
          console.error("Ошибка проверки команды пользователя:", err);
        }
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
      setToast({ message: "Заявка успешно отправлена!", type: "success" });
      setHasRequested(true);
    } catch (err: any) {
      console.error("Ошибка отправки заявки:", err);
      setToast({
        message: err.response?.data?.message || "Не удалось отправить заявку",
        type: "error",
      });
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!id) return;

    try {
      await HackmateApi.acceptRequest(parseInt(id), requestId);
      setToast({ message: "Заявка принята!", type: "success" });
      loadTeam();
    } catch (err: any) {
      console.error("Ошибка принятия заявки:", err);
      setToast({
        message: err.response?.data?.message || "Не удалось принять заявку",
        type: "error",
      });
    }
  };

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = parseInt(e.target.value);
    if (!roleId) return;
    const role = availableRoles.find((r) => r.id === roleId);
    if (role && !selectedRoles.find((r) => r.id === role.id)) {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleRemoveRole = (roleId: number) => {
    setSelectedRoles(selectedRoles.filter((r) => r.id !== roleId));
  };

  const handleSaveRoles = async () => {
    if (!id || !teamId) return;

    try {
      await HackmateApi.updateTeamRoles(
        parseInt(id),
        parseInt(teamId),
        selectedRoles.map((r) => r.id)
      );
      setToast({ message: "Роли обновлены!", type: "success" });
      setEditingRoles(false);
      loadTeam();
    } catch (err: any) {
      console.error("Ошибка обновления ролей:", err);
      setToast({
        message: err.response?.data?.message || "Не удалось обновить роли",
        type: "error",
      });
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

  const neededRoles = team.needed_roles || [];

  return (
    <div className={styles.container}>
      <ProfileHeader title={team.name} />
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.content}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.info}>
          <div className={styles.photo}>
            <img src={teamPhoto} alt="team" />
          </div>
          <div className={styles.textBox}>
            <h2 className={styles.teamName}>{team.name}</h2>
            <div className={styles.membersCount}>
              Участников: {team.cur_size ?? team.members.length} /{" "}
              {team.max_size}
            </div>
            {team.members.length > 0 && team.members[0].add_info && (
              <div className={styles.additionalInfo}>
                {team.members[0].add_info}
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Кого ищем:</h2>
            {isCaptain && (
              <button
                className={styles.editButton}
                onClick={() => setEditingRoles(!editingRoles)}
                title="Редактировать роли"
              >
                <img src={editIcon} alt="edit" />
              </button>
            )}
          </div>
          {editingRoles ? (
            <div className={styles.editRolesContainer}>
              <div className={styles.selectedRolesContainer}>
                {selectedRoles.map((role) => (
                  <div key={role.id} className={styles.roleChip}>
                    <span>{role.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role.id)}
                      className={styles.removeRoleButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <select
                value=""
                onChange={handleRoleSelect}
                className={styles.roleSelect}
              >
                <option value="">Выберите роль</option>
                {availableRoles
                  .filter(
                    (role) => !selectedRoles.find((r) => r.id === role.id)
                  )
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
              </select>
              <div className={styles.editActions}>
                <button className={styles.saveButton} onClick={handleSaveRoles}>
                  Сохранить
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditingRoles(false);
                    if (team.needed_roles) {
                      setSelectedRoles(team.needed_roles);
                    }
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.rolesList}>
              {neededRoles.length > 0 ? (
                neededRoles.map((role) => (
                  <span key={role.id} className={styles.roleTag}>
                    {role.name}
                  </span>
                ))
              ) : (
                <div className={styles.emptyText}>Роли не указаны</div>
              )}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Участники команды:</h2>
          <div className={styles.membersList}>
            {team.members.length === 0 ? (
              <div className={styles.emptyText}>Участники не найдены</div>
            ) : (
              team.members.map((member) => (
                <div
                  key={member.id}
                  className={styles.memberCard}
                  onClick={() =>
                    navigate(`/hackathons/${id}/participants/${member.id}`)
                  }
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
                  {member.skills && member.skills.length > 0 && (
                    <div className={styles.memberSkills}>
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
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {isCaptain && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Заявки на вступление</h2>
            {requests.length === 0 ? (
              <div className={styles.emptyText}>Заявок пока нет</div>
            ) : (
              <div className={styles.requestsList}>
                {requests.map((request) => (
                  <div key={request.id} className={styles.requestCard}>
                    <div className={styles.requestInfo}>
                      <span className={styles.requestId}>
                        Заявка #{request.id}
                      </span>
                    </div>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={
                        (team.cur_size ?? team.members.length) >= team.max_size
                      }
                    >
                      Принять
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isCaptain &&
          (!userTeamId || userTeamId <= 0) &&
          (team.cur_size ?? team.members.length) < team.max_size &&
          (hasRequested ? (
            <div className={styles.requestSent}>
              Заявка подана
            </div>
          ) : (
            <button
              className={styles.requestButton}
              onClick={handleRequestJoin}
            >
              Подать заявку
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
