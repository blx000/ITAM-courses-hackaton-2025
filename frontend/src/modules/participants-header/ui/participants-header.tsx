import styles from "./participants-header.module.css";
import questionIcon from "/question-icon.svg";
import bellIcon from "/bell-icon.svg";
import { NavLink } from "react-router";

interface ParticipantsHeaderProps {
  title: string;
}

export function ParticipantsHeader({ title }: ParticipantsHeaderProps) {
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

