import { useState, useEffect, useRef } from "react";
import styles from "./participant-search.module.css";
import searchIcon from "/search-icon.svg";
import sortIcon from "/sort-icon.svg";
import type { Role } from "../../../api";
import { HackmateApi } from "../../../api";

interface ParticipantSearchProps {
  placeholder?: string;
  onSearchChange: (query: string) => void;
  onRoleFilterChange?: (roleIds: number[]) => void;
  selectedRoleIds?: number[];
}

export function ParticipantSearch({
  placeholder = "Поиск...",
  onSearchChange,
  onRoleFilterChange,
  selectedRoleIds: externalSelectedRoleIds,
}: ParticipantSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [internalSelectedRoleIds, setInternalSelectedRoleIds] = useState<number[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedRoleIds = externalSelectedRoleIds !== undefined ? externalSelectedRoleIds : internalSelectedRoleIds;

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };

    if (showRoleDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoleDropdown]);

  const loadRoles = async () => {
    try {
      const rolesData = await HackmateApi.getRoles();
      // Sort roles alphabetically by name
      const sortedRoles = [...rolesData].sort((a, b) =>
        a.name.localeCompare(b.name, "ru")
      );
      setRoles(sortedRoles);
    } catch (err) {
      console.error("Ошибка загрузки ролей:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearchChange("");
  };

  const handleSortClick = () => {
    setShowRoleDropdown(!showRoleDropdown);
  };

  const handleRoleToggle = (roleId: number) => {
    const newSelectedIds = selectedRoleIds.includes(roleId)
      ? selectedRoleIds.filter((id) => id !== roleId)
      : [...selectedRoleIds, roleId];

    if (externalSelectedRoleIds === undefined) {
      setInternalSelectedRoleIds(newSelectedIds);
    }
    onRoleFilterChange?.(newSelectedIds);
  };

  const handleClearAll = () => {
    const newSelectedIds: number[] = [];
    if (externalSelectedRoleIds === undefined) {
      setInternalSelectedRoleIds(newSelectedIds);
    }
    onRoleFilterChange?.(newSelectedIds);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
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

          <button
            type="button"
            onClick={handleSortClick}
            className={styles.sortButton}
            title={
              selectedRoleIds.length > 0
                ? `Выбрано ролей: ${selectedRoleIds.length}`
                : "Фильтр по ролям"
            }
          >
            <img src={sortIcon} alt="sort-icon" />
            {selectedRoleIds.length > 0 && (
              <span className={styles.roleCount}>{selectedRoleIds.length}</span>
            )}
          </button>

          {showRoleDropdown && (
            <div className={styles.roleDropdown}>
              <div className={styles.roleDropdownHeader}>
                <span>Выбор ролей</span>
                {selectedRoleIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className={styles.clearAllButton}
                  >
                    Очистить
                  </button>
                )}
              </div>
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`${styles.roleOption} ${
                    selectedRoleIds.includes(role.id) ? styles.selected : ""
                  }`}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className={styles.roleCheckbox}
                  />
                  {role.name}
                </div>
              ))}
            </div>
          )}

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


