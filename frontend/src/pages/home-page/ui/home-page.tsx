import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import type { HackathonShort } from "../../../api";
import styles from "./home-page.module.css";

export function HomePage() {
  const [hackathons, setHackathons] = useState<HackathonShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      const data = await HackmateApi.getHackathons();
      setHackathons(data);
    } catch (err) {
      setError("Ошибка загрузки хакатонов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  return (
    <div className={styles.container}>
      <div className={styles.hacks}>
        <h2>Хакатоны:</h2>

        {loading && <div>Загрузка...</div>}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && hackathons.length === 0 && (
          <div>Хакатоны не найдены</div>
        )}

        {!loading && !error && hackathons.length > 0 && (
          <div className={styles.hackList}>
            {hackathons.map((hack) => (
              <div
                key={hack.id}
                className={styles.hackItem}
                onClick={() => navigate(`/hackathons/${hack.id}`)}
              >
                <h3>{hack.name}</h3>
                <p>{hack.description}</p>
                <div className={styles.dates}>
                  <span>{formatDate(hack.start_date)}</span>
                  <span> - </span>
                  <span>{formatDate(hack.end_date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
