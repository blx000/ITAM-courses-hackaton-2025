import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import styles from "./hackathon-info.module.css";
import hackathonPhoto from "/hackathon-photo.svg";
import bgImage from "/bg-image.png";
import { HackmateApi } from "../../../api";
import type { HackathonPage } from "../../../api";

export function HackathonInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState<HackathonPage | null>(null);
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [isParticipating, setIsParticipating] = useState(false);
  const [checkingParticipation, setCheckingParticipation] = useState(true);

  useEffect(() => {
    const loadHackathon = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setCheckingParticipation(true);
        const hackathonId = parseInt(id);
        const hackathonData = await HackmateApi.getHackathon(hackathonId);
        setHackathon(hackathonData);
        const teams = await HackmateApi.getHackathonTeams(hackathonId);
        const count = teams.reduce(
          (total, team) => total + team.members.length,
          0
        );
        setParticipantsCount(count);
        
        try {
          setIsParticipating(false);
        } catch (err) {
          setIsParticipating(false);
        }
      } catch (error) {
        console.error("Ошибка загрузки хакатона:", error);
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
      navigate(`/form?hackathon=${hackathon.id}`);
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
              <button className={styles.btn} onClick={handleJoinClick}>
                Присоединиться к хакатону
              </button>
            ) : (
              <>
                <button className={styles.btn} onClick={handleViewParticipants}>
                  Участники и команды
                </button>
                <button 
                  className={styles.btnSecondary} 
                  onClick={() => navigate(`/hackathons/${id}/teams`)}
                >
                  Список команд
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
