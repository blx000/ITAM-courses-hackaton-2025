import styles from "./admin-header.module.css";
import adminIcon from "/admin-icon.svg";
import searchIcon from "/search-icon.svg";

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AdminHeader({ searchQuery, onSearchChange }: AdminHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        <img src={adminIcon} alt="Admin" className={styles.adminIcon} />
        <span className={styles.adminText}>
          Hack <span>Mate</span> admin
        </span>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.searchBox}>
          <img src={searchIcon} alt="search" className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск хакатона по названию..."
            className={styles.searchInput}
          />
        </div>
      </div>
    </div>
  );
}

