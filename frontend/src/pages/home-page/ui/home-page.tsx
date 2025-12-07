import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../../../shared/context/app-context";
import styles from "./home-page.module.css";
import bgImage from "/bg-image.png";
import hackathonIcon from "/hackathon-photo.svg";
import type { HackathonShort } from "../../../api";

export function HomePage() {
  const { hackathons, loading } = useApp();
  const [featuredHackathon, setFeaturedHackathon] =
    useState<HackathonShort | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (hackathons.length > 0) {
      setFeaturedHackathon(hackathons[0]);
    }
  }, [hackathons]);

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
          {loading.hackathons && <div className={styles.loading}>Загрузка...</div>}
          {!loading.hackathons && hackathons.length === 0 && (
            <div className={styles.empty}>Хакатоны не найдены</div>
          )}
          {!loading.hackathons && hackathons.length > 0 && (
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
                      <p className={styles.hackathonCompany}>направление</p>
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
