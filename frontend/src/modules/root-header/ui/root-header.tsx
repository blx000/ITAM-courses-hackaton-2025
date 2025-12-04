import { useState } from "react";
import styles from "./root-header.module.css";
import profileIcon from "/profile-icon.svg";
import searchIcon from "/search-icon.svg";
import questionIcon from "/question-icon.svg";
import bellIcon from "/bell-icon.svg";
import { useNavigate } from "react-router";
import { NavLink } from "react-router";

type MenuOption = {
  label: string;
  path: string;
};

const menuOptions: MenuOption[] = [
  { label: "Мой профиль", path: "/profile" },
  { label: "Мои команды", path: "/commands" },
];

export function RootHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleMenuSelect = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.profileMenu}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
          >
            <img src={profileIcon} alt="profile-icon" />
          </button>
        </div>
        <div className={styles.icons}>
          <img src={searchIcon} alt="search-icon" />
          <NavLink to={"/help"}>
            <img src={questionIcon} alt="question-icon" />
          </NavLink>
          <img src={bellIcon} alt="bell-icon" />
        </div>
      </div>
      <div
        className={`${styles.sidebarOverlay} ${
          isMenuOpen ? styles.sidebarOverlayVisible : ""
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        className={`${styles.menuDropdown} ${
          isMenuOpen ? styles.menuDropdownOpen : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <button
            className={styles.closeButton}
            onClick={() => setIsMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className={styles.menuItems}>
          {menuOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleMenuSelect(option.path)}
              className={styles.menuItem}
            >
              <span className={styles.menuItemLabel}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
