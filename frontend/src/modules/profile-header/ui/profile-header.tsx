import styles from "./profile-header.module.css";
import questionIcon from "/question-icon.svg";
import bellIcon from "/bell-icon.svg";
import { NavLink } from "react-router";

interface ProfileHeaderProps {
  title?: string;
}

export function ProfileHeader({ title = "Мой профиль" }: ProfileHeaderProps) {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <div className={styles.icons}>
        <NavLink to={"/help"}>
          <img src={questionIcon} alt="question-icon" />
        </NavLink>
        <NavLink to={"/notifications"}>
          <img src={bellIcon} alt="bell-icon" />
        </NavLink>
      </div>
    </div>
  );
}
