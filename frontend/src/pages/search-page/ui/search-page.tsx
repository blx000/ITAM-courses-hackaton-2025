import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./search-page.module.css";
import { HackmateApi } from "../../../api";
import type { HackathonShort } from "../../../api";
import { Navigation } from "../../../modules/navigation";
import bgImage from "/bg-image3.png";
import searchIcon from "/search-icon.svg";
import hackathonIcon from "/hackathon-photo.svg";

export function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [hackathons, setHackathons] = useState<HackathonShort[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      setLoading(true);
      const data = await HackmateApi.getHackathons();
      setHackathons(data);
    } catch (err) {
      console.error("Ошибка загрузки хакатонов:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHackathons = hackathons.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrize = (amount: number) => {
    return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.content}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchIcon}>
              <img src={searchIcon} alt="search" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск хакатона..."
              className={styles.searchInput}
            />
          </div>
        </div>
        <div className={styles.results}>
          {loading && <div className={styles.loading}>Загрузка...</div>}

          {!loading && (
            <div className={styles.resultsList}>
              {filteredHackathons.length === 0 ? (
                <div className={styles.empty}>
                  {searchQuery ? "Хакатоны не найдены" : "Хакатоны не найдены"}
                </div>
              ) : (
                filteredHackathons.map((hack) => (
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
                    <div className={styles.hackathonPrize}>
                      {formatPrize(hack.prize ?? 0)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
}
