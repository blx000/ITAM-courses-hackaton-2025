import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import styles from "./search-page.module.css";
import { HackmateApi } from "../../../api";
import type { HackathonShort, Participant, Team } from "../../../api";
import bgImage from "/bg-image.png";
import searchIcon from "/search-icon.svg";

type SearchTab = "hackathons" | "participants" | "teams";

export function SearchPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>("hackathons");
  const [searchQuery, setSearchQuery] = useState("");
  const [hackathons, setHackathons] = useState<HackathonShort[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
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

  const loadParticipants = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await HackmateApi.getHackathonParticipants(parseInt(id));
      setParticipants(data);
    } catch (err) {
      console.error("Ошибка загрузки участников:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await HackmateApi.getHackathonTeams(parseInt(id));
      setTeams(data);
    } catch (err) {
      console.error("Ошибка загрузки команд:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHackathons = hackathons.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParticipants = participants.filter(
    (p) =>
      `${p.first_name} ${p.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      p.role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "hackathons" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveTab("hackathons");
              loadHackathons();
            }}
          >
            Хакатоны
          </button>
          {id && (
            <>
              <button
                className={`${styles.tab} ${
                  activeTab === "participants" ? styles.active : ""
                }`}
                onClick={() => {
                  setActiveTab("participants");
                  loadParticipants();
                }}
              >
                Участники
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "teams" ? styles.active : ""
                }`}
                onClick={() => {
                  setActiveTab("teams");
                  loadTeams();
                }}
              >
                Команды
              </button>
            </>
          )}
        </div>

        <div className={styles.results}>
          {loading && <div className={styles.loading}>Загрузка...</div>}
          
          {activeTab === "hackathons" && !loading && (
            <div className={styles.resultsList}>
              {filteredHackathons.length === 0 ? (
                <div className={styles.empty}>
                  {searchQuery ? "Хакатоны не найдены" : "Хакатоны не найдены"}
                </div>
              ) : (
                filteredHackathons.map((hack) => (
                  <div 
                    key={hack.id} 
                    className={styles.resultCard}
                    onClick={() => navigate(`/hackathons/${hack.id}`)}
                  >
                    <h3>{hack.name}</h3>
                    <p>{hack.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "participants" && !loading && (
            <div className={styles.resultsList}>
              {filteredParticipants.length === 0 ? (
                <div className={styles.empty}>Участники не найдены</div>
              ) : (
                filteredParticipants.map((p) => (
                  <div key={p.id} className={styles.resultCard}>
                    <h3>
                      {p.first_name} {p.last_name}
                    </h3>
                    <p>{p.role.name}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "teams" && !loading && (
            <div className={styles.resultsList}>
              {filteredTeams.length === 0 ? (
                <div className={styles.empty}>Команды не найдены</div>
              ) : (
                filteredTeams.map((team) => (
                  <div key={team.id} className={styles.resultCard}>
                    <h3>{team.name}</h3>
                    <p>Участников: {team.members.length}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
