import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./calendar-page.module.css";
import { Calendar } from "../../../modules/calendar";
import { HackmateApi, AuthService } from "../../../api";
import { useApp } from "../../../shared/context";
import type { HackathonShort } from "../../../api";
import bgImage from "/bg-image.png";

type ViewMode = "month" | "week" | "year";

export function CalendarPage() {
  const navigate = useNavigate();
  const { hackathons, loading } = useApp();
  const [userHackathons, setUserHackathons] = useState<HackathonShort[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  useEffect(() => {
    loadUserHackathons();
  }, [hackathons]);

  const loadUserHackathons = async () => {
    try {
      const userHacks: HackathonShort[] = [];
      const userId = AuthService.getUserId();

      if (userId && hackathons.length > 0) {
        const currentUser = await HackmateApi.getCurrentUser();

        for (const hack of hackathons) {
          try {
            const participants = await HackmateApi.getHackathonParticipants(
              hack.id
            );

            const isParticipant = participants.some(
              (p: any) =>
                p.first_name === currentUser.first_name &&
                p.last_name === currentUser.last_name
            );

            if (isParticipant) {
              const now = new Date();
              const startDate = new Date(hack.start_date);
              if (startDate >= now) {
                userHacks.push(hack);
              }
            }
          } catch (err) {
            console.error(
              `Ошибка загрузки участников для хакатона ${hack.id}:`,
              err
            );
          }
        }
      }

      setUserHackathons(userHacks);
    } catch (err: any) {
      console.error("Ошибка загрузки календаря:", err);
    }
  };

  const getUpcomingHackathons = () => {
    const now = new Date();
    return userHackathons
      .filter((hack) => new Date(hack.start_date) >= now)
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
      .slice(0, 5);
  };

  const handleDateClick = (date: Date) => {
    const hackathonsOnDate = hackathons.filter((hack) => {
      const startDate = new Date(hack.start_date);
      const endDate = new Date(hack.end_date);
      return date >= startDate && date <= endDate;
    });

    if (hackathonsOnDate.length > 0) {
      navigate(`/hackathons/${hackathonsOnDate[0].id}`);
    }
  };

  const upcomingHackathons = getUpcomingHackathons();

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.content}>
        <div className={styles.options}>
          <button
            className={`${styles.item} ${
              viewMode === "week" ? styles.active : ""
            }`}
            onClick={() => setViewMode("week")}
          >
            Неделя
          </button>
          <button
            className={`${styles.item} ${
              viewMode === "month" ? styles.active : ""
            }`}
            onClick={() => setViewMode("month")}
          >
            Месяц
          </button>
          <button
            className={`${styles.item} ${
              viewMode === "year" ? styles.active : ""
            }`}
            onClick={() => setViewMode("year")}
          >
            Год
          </button>
        </div>

        <Calendar hackathons={userHackathons} onDateClick={handleDateClick} />

        <div className={styles.hacks}>
          <h2>Предстоящие хакатоны</h2>

          {loading.hackathons ? (
            <p className={styles.loading}>Загрузка...</p>
          ) : upcomingHackathons.length === 0 ? (
            <p className={styles.empty}>Нет предстоящих хакатонов</p>
          ) : (
            <div className={styles.hackathonsList}>
              {upcomingHackathons.map((hack) => (
                <div
                  key={hack.id}
                  className={styles.hackItem}
                  onClick={() => navigate(`/hackathons/${hack.id}`)}
                >
                  <h3>{hack.name}</h3>
                  <p>{hack.description}</p>
                  <div className={styles.dates}>
                    <span>
                      {new Date(hack.start_date).toLocaleDateString("ru-RU")}
                    </span>
                    <span> - </span>
                    <span>
                      {new Date(hack.end_date).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <button
                    className={styles.viewButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/hackathons/${hack.id}`);
                    }}
                  >
                    Подробнее
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
