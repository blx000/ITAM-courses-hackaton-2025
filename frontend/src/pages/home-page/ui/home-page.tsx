import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import type { HackathonShort } from "../../../api";
import styles from "./home-page.module.css";
import bgImage from "/bg-image.png";
import hackathonIcon from "/hackathon-photo.svg";

export function HomePage() {
  const [hackathons, setHackathons] = useState<HackathonShort[]>([]);
  const [featuredHackathon, setFeaturedHackathon] =
    useState<HackathonShort | null>(null);
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
      if (data.length > 0) {
        setFeaturedHackathon(data[0]);
      }
    } catch (err) {
      setError("Ошибка загрузки хакатонов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrize = (amount: number) => {
    return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Главные события</h2>
          {featuredHackathon && (
            <div
              className={styles.featuredCard}
              onClick={() => navigate(`/hackathons/${featuredHackathon.id}`)}
            >
              <div className={styles.featuredContent}>
                <div className={styles.featuredIcon}>
                  <img src={hackathonIcon} alt="hackathon" />
                </div>
                <div className={styles.featuredInfo}>
                  <div className={styles.featuredHeader}>
                    <h3 className={styles.featuredTitle}>
                      {featuredHackathon.name}
                    </h3>
                    <p className={styles.featuredCompany}>компания</p>
                  </div>
                  <p className={styles.featuredDescription}>
                    {featuredHackathon.description}
                  </p>
                </div>
              </div>
              <div className={styles.featuredPrize}>{formatPrize(0)}</div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Хакатоны</h2>
          {loading && <div className={styles.loading}>Загрузка...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {!loading && !error && hackathons.length === 0 && (
            <div className={styles.empty}>Хакатоны не найдены</div>
          )}
          {!loading && !error && hackathons.length > 0 && (
            <div className={styles.hackathonsList}>
              {hackathons.map((hack) => (
                <div
                  key={hack.id}
                  className={styles.hackathonCard}
                  onClick={() => navigate(`/hackathons/${hack.id}`)}
                >
                  <div className={styles.hackathonContent}>
                    <div className={styles.hackathonIcon}>
                      <img src={hackathonIcon} alt="hackathon" />
                    </div>
                    <div className={styles.hackathonInfo}>
                      <h3 className={styles.hackathonTitle}>{hack.name}</h3>
                      <p className={styles.hackathonCompany}>компания</p>
                    </div>
                  </div>
                  <div className={styles.hackathonPrize}>{formatPrize(0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
