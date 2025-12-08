import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../../../shared/context/app-context";
import type { HackathonShort } from "../../../api";
import styles from "./hackathon-search.module.css";
import searchIcon from "/search-icon.svg";

interface HackathonSearchProps {
  placeholder?: string;
  compactMode?: boolean;
  className?: string;
}

export function HackathonSearch({
  placeholder = "Поиск хакатона...",
  className,
}: HackathonSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { hackathons } = useApp();
  const [filteredHackathons, setFilteredHackathons] = useState<
    HackathonShort[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

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
      setFilteredHackathons([]);
    }
  }, [searchQuery, hackathons]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(e.target.value.trim().length > 0);
  };

  const handleHackathonSelect = (hackathonId: number) => {
    navigate(`/hackathons/${hackathonId}`);
    setSearchQuery("");
    setShowResults(false);
  };
  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className={`${styles.container} ${className ? styles[className] : ""}`}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <img src={searchIcon} alt="search-icon" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className={styles.searchInput}
          />
        </div>
      </form>

      {showResults && filteredHackathons.length > 0 && (
        <div className={styles.resultsDropdown}>
          {filteredHackathons.slice(0, 5).map((hackathon) => (
            <div
              key={hackathon.id}
              className={styles.resultItem}
              onClick={() => handleHackathonSelect(hackathon.id)}
            >
              <div className={styles.resultName}>{hackathon.name}</div>
              <div className={styles.resultDates}>
                {new Date(hackathon.start_date).toLocaleDateString()} -{" "}
                {new Date(hackathon.end_date).toLocaleDateString()}
              </div>
            </div>
          ))}

          {filteredHackathons.length > 5 && (
            <div
              className={styles.showAllResults}
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                setShowResults(false);
              }}
            >
              Показать все результаты ({filteredHackathons.length})
            </div>
          )}
        </div>
      )}

      {showResults && searchQuery.trim() && filteredHackathons.length === 0 && (
        <div className={styles.noResults}>Хакатоны не найдены</div>
      )}
    </div>
  );
}
