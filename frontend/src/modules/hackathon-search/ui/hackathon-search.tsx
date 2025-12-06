import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import type { HackathonShort } from "../../../api";
import styles from "./hackathon-search.module.css";

interface HackathonSearchProps {
  placeholder?: string;
  compactMode?: boolean;
}

export function HackathonSearch({
  placeholder = "Поиск хакатона...",
}: HackathonSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hackathons, setHackathons] = useState<HackathonShort[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<
    HackathonShort[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    HackmateApi.getHackathons().then(setHackathons).catch(console.error);
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

  const handleClearSearch = () => {
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
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
              <path
                d="M21.74 19.58L15.16 13C16.47 11.59 17.25 9.69 17.25 7.62C17.25 3.41 13.84 0 9.62 0C5.41 0 2 3.41 2 7.62C2 11.83 5.41 15.24 9.62 15.24C11.69 15.24 13.59 14.46 15 13.16L21.58 19.74C21.74 19.9 21.9 20 22 20C22.1 20 22.26 19.9 22.42 19.74C22.74 19.42 22.74 18.9 22.42 18.58L21.74 19.58ZM9.62 13.24C6.49 13.24 4 10.75 4 7.62C4 4.49 6.49 2 9.62 2C12.75 2 15.24 4.49 15.24 7.62C15.24 10.75 12.75 13.24 9.62 13.24Z"
                fill="#B1B1B1"
              />
            </svg>
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

          {searchQuery ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className={styles.clearIcon}
              aria-label="Очистить поиск"
            >
              <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
                <path
                  d="M17.5 10.58L9 2.08L0.5 10.58L0 10.08L8.5 1.58L9 1.08L9.5 1.58L18 10.08L17.5 10.58Z"
                  fill="#B1B1B1"
                />
              </svg>
            </button>
          ) : (
            <div className={styles.rightIcon}>
              <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
                <path
                  d="M17.5 10.58L9 2.08L0.5 10.58L0 10.08L8.5 1.58L9 1.08L9.5 1.58L18 10.08L17.5 10.58Z"
                  fill="#B1B1B1"
                />
              </svg>
            </div>
          )}
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
