import { useState } from "react";
import styles from "./hackathon-header.module.css";
import questionIcon from "/question-icon.svg";
import bellIcon from "/bell-icon.svg";
import { NavLink } from "react-router";
import type { HackathonPage } from "../../../api";

export function FormHeader() {
  const [hackathon, setHackathon] = useState<HackathonPage | null>(null);
  return (
    <div className={styles.container}>
      <h1>Название хакатона</h1>
      <div className={styles.icons}>
        <NavLink to={"/help"}>
          <img src={questionIcon} alt="question-icon" />
        </NavLink>
        <NavLink to={"/notifications"}>
          <img src={bellIcon} alt="bell-icon" />
        </NavLink>
      </div>
      <div className={styles.buttons}>
        <NavLink
          to={
            hackathon
              ? `/hackathons/${hackathon.id}/participants`
              : "/participants"
          }
          className={styles.btn}
        >
          Участники
        </NavLink>
        <NavLink
          to={hackathon ? `/hackathons/${hackathon.id}/teams` : "/teams"}
          className={styles.btn}
        >
          Команды
        </NavLink>
      </div>
    </div>
  );
}
