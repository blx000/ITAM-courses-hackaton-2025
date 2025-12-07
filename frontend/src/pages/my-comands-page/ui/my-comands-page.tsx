import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { TeamShort, Team, Request, Invite } from "../../../api";
import { ProfileHeader } from "../../../modules/profile-header";
import { Toast } from "../../../shared/components/toast";
import styles from "./my-comands-page.module.css";
import bgImage from "/bg-image3.png";
import teamPhoto from "/team-photo.svg";

export function MyComandPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamShort[]>([]);
  const [captainTeam, setCaptainTeam] = useState<Team | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [invitations, setInvitations] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hackathonId, setHackathonId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = AuthService.getUserId();
      if (!userId) {
        setError("Пользователь не авторизован");
        setLoading(false);
        return;
      }

      const userTeams = await HackmateApi.getUserTeams(userId);
      setTeams(userTeams);

      if (userTeams.length > 0) {
        for (const teamShort of userTeams) {
          try {
            const teamData = await HackmateApi.getTeam(
              teamShort.hack_id,
              teamShort.id
            );

            const userId = AuthService.getUserId();
            if (teamData.captain_id === userId) {
              setCaptainTeam(teamData);
              setHackathonId(teamShort.hack_id);

              try {
                const [requestsData, invitationsData] = await Promise.all([
                  HackmateApi.getTeamRequests(teamShort.hack_id),
                  HackmateApi.getInvitations(teamShort.hack_id),
                ]);

                const teamRequests = requestsData.filter(
                  (r) => r.team_id === teamData.id
                );
                const teamInvitations = invitationsData.filter(
                  (inv) => inv.team_id === teamData.id
                );

                setRequests(teamRequests);
                setInvitations(teamInvitations);
              } catch (err) {
                console.error("Ошибка загрузки заявок и приглашений:", err);
              }

              break;
            }
          } catch (err) {
            console.error(
              `Ошибка загрузки данных команды ${teamShort.id}:`,
              err
            );
          }
        }
      }
    } catch (err: any) {
      console.error("Ошибка загрузки данных:", err);
      setError("Не удалось загрузить данные команд");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!hackathonId) return;

    try {
      await HackmateApi.acceptRequest(hackathonId, requestId);
      setToast({ message: "Заявка принята!", type: "success" });
      loadData();
    } catch (err: any) {
      console.error("Ошибка принятия заявки:", err);
      setToast({
        message: err.response?.data?.message || "Не удалось принять заявку",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <ProfileHeader title="Мои команды" />
        <div className={styles.backgroundImage}>
          <img src={bgImage} alt="background" />
        </div>
        <div className={styles.content}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className={styles.container}>
        <ProfileHeader title="Мои команды" />
        <div className={styles.backgroundImage}>
          <img src={bgImage} alt="background" />
        </div>
        <div className={styles.content}>
          <div className={styles.empty}>
            Вы не состоите ни в одной команде
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProfileHeader title="Мои команды" />
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}

        {teams.map((teamShort) => (
          <div
            key={teamShort.id}
            className={styles.teamCard}
            onClick={() =>
              navigate(`/hackathons/${teamShort.hack_id}/teams/${teamShort.id}`)
            }
          >
            <div className={styles.teamInfo}>
              <div className={styles.photo}>
                <img src={teamPhoto} alt="team" />
              </div>
              <div className={styles.textBox}>
                <h2 className={styles.teamName}>{teamShort.name}</h2>
                <div className={styles.membersCount}>
                  Участников: {teamShort.cur_size ?? 0} / {teamShort.max_size}
                </div>
                <div className={styles.hackathonName}>
                  {teamShort.hack_name}
                </div>
              </div>
            </div>
          </div>
        ))}

        {captainTeam && (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Управление командой</h2>
              <div className={styles.info}>
                <div className={styles.photo}>
                  <img src={teamPhoto} alt="team" />
                </div>
                <div className={styles.textBox}>
                  <h2 className={styles.teamName}>{captainTeam.name}</h2>
                  <div className={styles.membersCount}>
                    Участников: {captainTeam.cur_size ?? captainTeam.members.length} /{" "}
                    {captainTeam.max_size}
                  </div>
                </div>
              </div>
            </div>

            {captainTeam.needed_roles && captainTeam.needed_roles.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Кого ищем:</h2>
                <div className={styles.rolesList}>
                  {captainTeam.needed_roles.map((role) => (
                    <span key={role.id} className={styles.roleTag}>
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Участники команды</h2>
              <div className={styles.membersList}>
                {captainTeam.members.length === 0 ? (
                  <div className={styles.emptyText}>Участники не найдены</div>
                ) : (
                  captainTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className={styles.memberCard}
                      onClick={() =>
                        navigate(
                          `/hackathons/${hackathonId}/participants/${member.id}`
                        )
                      }
                    >
                      <div className={styles.memberInfo}>
                        <h3 className={styles.memberName}>
                          {member.first_name} {member.last_name}
                        </h3>
                        {member.id === captainTeam.captain_id && (
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
                          (captainTeam.cur_size ?? captainTeam.members.length) >= captainTeam.max_size
                        }
                      >
                        Принять
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Отправленные приглашения</h2>
              {invitations.length === 0 ? (
                <div className={styles.emptyText}>Отправленных приглашений пока нет</div>
              ) : (
                <div className={styles.invitationsList}>
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className={styles.invitationCard}>
                      <div className={styles.invitationInfo}>
                        {invitation.participant ? (
                          <span className={styles.participantName}>
                            {invitation.participant.first_name}{" "}
                            {invitation.participant.last_name}
                          </span>
                        ) : (
                          <span className={styles.participantName}>
                            Участник #{invitation.participant_id}
                          </span>
                        )}
                      </div>
                      <span className={styles.invitationStatus}>
                        Ожидает ответа
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
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
