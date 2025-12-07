import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import { useApp } from "../../../shared/context/app-context";
import type { HackathonShort } from "../../../api";
import { AdminHeader } from "../../../modules/admin-header";
import styles from "./admin-dashboard-page.module.css";
import bgImage from "/bg-image.png";
import hackathonIcon from "/hackathon-photo.svg";
import addIcon from "/add-icon.svg";
import peopleIcon from "/people-icon.svg";
import puzzleIcon from "/puzzle-icon.svg";
import prizeIcon from "/prize-icon.svg";

interface HackathonWithStats extends HackathonShort {
  participantsCount?: number;
  teamsCount?: number;
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { hackathons, loading, refreshHackathons } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setFilteredHackathons] = useState<HackathonShort[]>([]);
  const [hackathonsWithStats, setHackathonsWithStats] = useState<
    HackathonWithStats[]
  >([]);

  useEffect(() => {
    refreshHackathons();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      const results = hackathons.filter(
        (hack) =>
          hack.name.toLowerCase().includes(searchTerm) ||
          hack.description.toLowerCase().includes(searchTerm)
      );
      setFilteredHackathons(results);
    } else {
      setFilteredHackathons(hackathons);
    }
  }, [searchQuery, hackathons]);

  const getFilteredHackathonsWithStats = () => {
    if (searchQuery.trim()) {
      return hackathonsWithStats.filter((hack) => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          hack.name.toLowerCase().includes(searchTerm) ||
          hack.description.toLowerCase().includes(searchTerm)
        );
      });
    }
    return hackathonsWithStats;
  };

  useEffect(() => {
    loadStats();
  }, [hackathons]);

  const loadStats = async () => {
    try {
      const hackathonsStats: HackathonWithStats[] = [];

      for (const hack of hackathons) {
        try {
          const [participants, teams] = await Promise.all([
            HackmateApi.getHackathonParticipants(hack.id),
            HackmateApi.getHackathonTeams(hack.id),
          ]);
          const participantsCount = participants.length;
          const teamsCount = teams.length;

          hackathonsStats.push({
            ...hack,
            participantsCount,
            teamsCount,
            prize: hack.prize !== undefined && hack.prize !== null ? hack.prize : 0,
          });
        } catch (err) {
          console.error(`Error loading stats for hack ${hack.id}:`, err);
          hackathonsStats.push({
            ...hack,
            participantsCount: 0,
            teamsCount: 0,
            prize: hack.prize !== undefined && hack.prize !== null ? hack.prize : 0,
          });
        }
      }

      setHackathonsWithStats(hackathonsStats);
    } catch (err) {
      console.error("Error loading stats:", err);
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
      <AdminHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className={styles.content}>
        <div className={styles.header}>
          <button
            className={styles.addButton}
            onClick={() => navigate("/admin/hackathons/create")}
          >
            <img src={addIcon} alt="add" />
            Создать хакатон
          </button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Хакатоны</h2>
          {loading.hackathons && (
            <div className={styles.loading}>Загрузка...</div>
          )}
          {!loading.hackathons &&
            getFilteredHackathonsWithStats().length === 0 && (
              <div className={styles.empty}>
                {searchQuery ? "Хакатоны не найдены" : "Хакатоны не найдены"}
              </div>
            )}
          {!loading.hackathons &&
            getFilteredHackathonsWithStats().length > 0 && (
              <div className={styles.tableContainer}>
                <table className={styles.hackathonsTable}>
                 <thead>
                   <tr>
                     <th className={styles.tableHeader}>Хакатон</th>
                     <th className={styles.tableHeader}>
                       <div className={styles.headerWithIcon}>
                         <img src={peopleIcon} alt="people" className={styles.headerIcon} />
                         <span>Участники</span>
                       </div>
                     </th>
                     <th className={styles.tableHeader}>
                       <div className={styles.headerWithIcon}>
                         <img src={puzzleIcon} alt="puzzle" className={styles.headerIcon} />
                         <span>Команды</span>
                       </div>
                     </th>
                     <th className={styles.tableHeader}>
                       <div className={styles.headerWithIcon}>
                         <img src={prizeIcon} alt="prize" className={styles.headerIcon} />
                         <span>Приз</span>
                       </div>
                     </th>
                   </tr>
                 </thead>
                  <tbody>
                    {getFilteredHackathonsWithStats().map((hack) => (
                      <tr
                        key={hack.id}
                        className={styles.tableRow}
                        onClick={() => navigate(`/admin/hackathons/${hack.id}`)}
                      >
                        <td className={styles.hackathonCell}>
                          <div className={styles.hackathonInfo}>
                            <div className={styles.hackathonIcon}>
                              <img src={hackathonIcon} alt="hackathon" />
                            </div>
                            <div className={styles.hackathonDetails}>
                              <h3 className={styles.hackathonTitle}>
                                {hack.name}
                              </h3>
                              <p className={styles.hackathonDate}>
                                {new Date(hack.start_date).toLocaleDateString(
                                  "ru-RU",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          {hack.participantsCount ?? 0}
                        </td>
                        <td className={styles.tableCell}>
                          {hack.teamsCount ?? 0}
                        </td>
                         <td className={styles.tableCell}>
                           <span className={styles.prizeBadge}>
                             {hack.prize !== undefined && hack.prize !== null ? formatPrize(hack.prize) : "0 ₽"}
                           </span>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
