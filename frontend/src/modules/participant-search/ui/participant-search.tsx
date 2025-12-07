import { useState } from "react";
import styles from "./participant-search.module.css";
import searchIcon from "/search-icon.svg";

interface ParticipantSearchProps {
  placeholder?: string;
  onSearchChange: (query: string) => void;
}

export function ParticipantSearch({
  placeholder = "Поиск...",
  onSearchChange,
}: ParticipantSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearchChange("");
  };

  return (
    <div className={styles.container}>
      <form onSubmit={(e) => e.preventDefault()} className={styles.searchForm}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <img src={searchIcon} alt="search-icon" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={styles.searchInput}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={styles.clearIcon}
              aria-label="Очистить поиск"
            >
              <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
                <path
                  d="M17.5 10.58L9 2.08L0.5 10.58L0 10.08L8.5 1.58L9 1.08L9.5 1.58L18 10.08L17.5 10.58Z"
                  fill="rgba(249, 255, 238, 0.7)"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}


