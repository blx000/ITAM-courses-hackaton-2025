import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { User, TeamShort, Participant, HackathonShort } from "../../../api";
import styles from "./profile-page.module.css";
import bgImage from "/bg-image.png";
import editIcon from "/edit-icon.svg";
import profilePhoto from "/profile-photo.svg";

type ParticipantData = {
  participant: Participant;
  hackathon: HackathonShort;
};

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<TeamShort[]>([]);
  const [participantData, setParticipantData] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await HackmateApi.getCurrentUser();
      setUser(userData);
      const userId = AuthService.getUserId();
      
      if (userId) {
        try {
          const teamsData = await HackmateApi.getUserTeams(userId);
          setTeams(teamsData);
        } catch (err) {
          console.error("Не удалось загрузить команды:", err);
        }

        // Загружаем данные анкеты пользователя
        try {
          const hackathons = await HackmateApi.getHackathons();
          
          // Ищем хакатоны, в которых пользователь участвует
          for (const hackathon of hackathons) {
            try {
              const participants = await HackmateApi.getHackathonParticipants(hackathon.id);
              const userParticipant = participants.find(
                (p: Participant) => 
                  p.first_name === userData.first_name && 
                  p.last_name === userData.last_name
              );
              
              if (userParticipant) {
                setParticipantData({
                  participant: userParticipant,
                  hackathon: hackathon,
                });
                break; // Берем первый найденный
              }
            } catch (err) {
              // Пропускаем, если не удалось загрузить участников
              console.error(`Не удалось загрузить участников для хакатона ${hackathon.id}:`, err);
            }
          }
        } catch (err) {
          console.error("Не удалось загрузить данные анкеты:", err);
        }
      }
    } catch (err: any) {
      console.error("Ошибка загрузки профиля:", err);
      setError(
        err.response?.status === 401
          ? "Необходимо войти в систему"
          : "Не удалось загрузить профиль. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate("/profile/edit");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || "Не удалось загрузить профиль"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
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
            <h2 className={styles.surname}>{user.last_name || "Фамилия"}</h2>
            <h2 className={styles.name}>{user.first_name || "Имя"}</h2>
          </div>
          <button
            onClick={handleEdit}
            className={styles.editButton}
            aria-label="Редактировать профиль"
            title="Редактировать"
          >
            <img src={editIcon} alt="edit" />
          </button>
        </div>

      <div className={styles.phone}>
        <strong>Телеграм: </strong> @{user.login || "username"}
      </div>

      {participantData && (
        <>
          <div className={styles.addBox}>
            <h2>Опыт в хакатонах:</h2>
            <div className={styles.experience}>
              {participantData.participant.experience !== undefined && participantData.participant.experience !== null
                ? `${participantData.participant.experience} ${participantData.participant.experience === 1 ? 'хакатон' : participantData.participant.experience < 5 ? 'хакатона' : 'хакатонов'}`
                : 'Не указано'}
            </div>
          </div>

          <div className={styles.addBox}>
            <h2>Основная роль:</h2>
            <div className={styles.role}>
              {participantData.participant.role?.name || "Не указано"}
            </div>
          </div>

          {participantData.participant.skills && participantData.participant.skills.length > 0 && (
            <div className={styles.addBox}>
              <h2 className={styles.skillsTitle}>Стек:</h2>
              <div className={styles.skillsList}>
                {participantData.participant.skills.map((skill) => (
                  <span key={skill.id} className={styles.skillTag}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {participantData.participant.add_info && (
            <div className={styles.addBox}>
              <h2>Дополнительная информация:</h2>
              <div className={styles.text}>{participantData.participant.add_info}</div>
            </div>
          )}
        </>
      )}

      {user.bio && !participantData && (
        <div className={styles.addBox}>
          <h2>Дополнительная информация:</h2>
          <div className={styles.text}>{user.bio}</div>
        </div>
      )}

      {teams.length > 0 && (
        <div className={styles.teams}>
          <h2>Мои команды:</h2>
          <div className={styles.teamsList}>
            {teams.map((team) => (
              <div key={team.id} className={styles.teamItem}>
                <span className={styles.teamName}>{team.name}</span>
                <span className={styles.teamHack}>{team.hack_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
