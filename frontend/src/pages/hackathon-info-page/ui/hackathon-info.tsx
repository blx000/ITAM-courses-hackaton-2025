import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import styles from "./hackathon-info.module.css";
import hackathonPhoto from "/hackathon-photo.svg";
import bgImage from "/bg-image.png";
import { HackmateApi } from "../../../api";
import type { HackathonPage, Participant, User } from "../../../api";

export function HackathonInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState<HackathonPage | null>(null);
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [isParticipating, setIsParticipating] = useState(false);
  const [checkingParticipation, setCheckingParticipation] = useState(true);
  const [, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadHackathon = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setCheckingParticipation(true);
        const hackathonId = parseInt(id);
        
        // Загружаем данные параллельно
        const [hackathonData, teams, user] = await Promise.all([
          HackmateApi.getHackathon(hackathonId),
          HackmateApi.getHackathonTeams(hackathonId).catch(() => []),
          HackmateApi.getCurrentUser().catch(() => null),
        ]);
        
        setHackathon(hackathonData);
        setCurrentUser(user);
        
        const count = teams.reduce(
          (total, team) => total + (team.members?.length || 0),
          0
        );
        setParticipantsCount(count);
        
        // Проверяем, является ли пользователь участником
        // Загружаем участников отдельно для проверки
        let participants: Participant[] = [];
        if (user) {
          try {
            participants = await HackmateApi.getHackathonParticipants(hackathonId);
            
            // Ищем участника в списке по имени и фамилии (без учета регистра)
            const userParticipant = participants.find((p: Participant) => 
              p.first_name?.toLowerCase().trim() === user.first_name?.toLowerCase().trim() && 
              p.last_name?.toLowerCase().trim() === user.last_name?.toLowerCase().trim()
            );
            
            setIsParticipating(userParticipant !== undefined);
            
            // Логируем для отладки
            console.log("Проверка участия:", {
              user: `${user.first_name} ${user.last_name}`,
              participantsCount: participants.length,
              found: userParticipant !== undefined,
              participantId: userParticipant?.id
            });
          } catch (err) {
            console.error("Ошибка загрузки участников для проверки:", err);
            setIsParticipating(false);
          }
        } else {
          setIsParticipating(false);
        }
      } catch (error) {
        console.error("Ошибка загрузки хакатона:", error);
        setIsParticipating(false);
      } finally {
        setLoading(false);
        setCheckingParticipation(false);
      }
    };

    loadHackathon();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrize = (amount: number) => {
    return new Intl.NumberFormat("ru-RU").format(amount) + " руб";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  const handleJoinClick = () => {
    if (hackathon) {
      console.log("Переход на форму для хакатона:", hackathon.id);
      navigate(`/form?hackathon=${hackathon.id}`);
    } else {
      console.error("Hackathon is null, cannot navigate to form");
    }
  };

  const handleViewParticipants = () => {
    if (hackathon) {
      navigate(`/hackathons/${hackathon.id}/participants`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.content}>
        <div className={styles.info}>
          <img src={hackathonPhoto} alt="hackathon-photo" />
          <div className={styles.text}>
            <div className={styles.box}>
              <h2>{hackathon?.name || "Название хакатона"}</h2>
              <h3>
                {hackathon
                  ? `${formatDate(hackathon.start_date)} - ${formatDate(
                      hackathon.end_date
                    )}`
                  : "дата проведения"}
              </h3>
              <h4>
                {participantsCount > 0
                  ? `Участников: ${participantsCount}`
                  : "кол-во участников"}
              </h4>
            </div>
            <div className={styles.prize}>
              {hackathon ? formatPrize(hackathon.prize) : "000 000 руб"}
            </div>
          </div>
        </div>
        <div className={styles.description}>
          {hackathon?.description || "описание хакатона"}
        </div>
        
        {!checkingParticipation && (
          <div className={styles.actions}>
            {!isParticipating ? (
              <button 
                className={styles.btn} 
                onClick={handleJoinClick}
                disabled={!hackathon}
              >
                Присоединиться к хакатону
              </button>
            ) : (
              <button 
                className={styles.btn} 
                onClick={handleViewParticipants}
                disabled={!hackathon}
              >
                Просмотреть участников и команды
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
