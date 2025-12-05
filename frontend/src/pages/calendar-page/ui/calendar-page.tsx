import { useState, useEffect } from "react";
import styles from "./calendar-page.module.css";
import { Calendar } from "../../../modules/calendar";
import { HackmateApi } from "../../../api";
import type { HackathonShort } from "../../../api";

export function CalendarPage() {
  const [hackathons, setHackathons] = useState<HackathonShort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      const data = await HackmateApi.getHackathons();
      setHackathons(data);
    } catch (err) {
      console.error("Ошибка загрузки хакатонов:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingHackathons = () => {
    const now = new Date();
    return hackathons
      .filter((hack) => new Date(hack.start_date) >= now)
      .slice(0, 2);
  };

  const upcomingHackathons = getUpcomingHackathons();

  return (
    <div className={styles.container}>
      <div className={styles.options}>
        <div className={styles.item}>Неделя</div>
        <div className={styles.item}>Месяц</div>
        <div className={styles.item}>Год</div>
      </div>
      <Calendar />
      <div className={styles.hacks}>
        <h2>Предстоящие хакатоны</h2>

        {loading ? (
          <p>Загрузка...</p>
        ) : upcomingHackathons.length === 0 ? (
          <p>Нет предстоящих хакатонов</p>
        ) : (
          <div className={styles.hackathonsList}>
            {upcomingHackathons.map((hack) => (
              <div key={hack.id} className={styles.hackItem}>
                <h3>{hack.name}</h3>
                <p>{hack.description}</p>
                <div className={styles.dates}>
                  <span>{new Date(hack.start_date).toLocaleDateString()}</span>
                  <span> - </span>
                  <span>{new Date(hack.end_date).toLocaleDateString()}</span>
                </div>
                <button
                  className={styles.viewButton}
                  onClick={() =>
                    (window.location.href = `/hackathons/${hack.id}`)
                  }
                >
                  Подробнее
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
