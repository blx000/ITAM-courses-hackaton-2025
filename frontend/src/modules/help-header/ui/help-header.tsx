import styles from "./help-header.module.css";
import questionIconGreen from "/question-icon-green.svg";
import bellIcon from "/bell-icon.svg";
import { NavLink } from "react-router";

export function HelpHeader() {
  return (
    <div className={styles.container}>
      <h1>Подсказки</h1>
      <div className={styles.icons}>
        <img src={questionIconGreen} alt="question-icon" />
        <NavLink to={"/notifications"}>
          <img src={bellIcon} alt="bell-icon" />
        </NavLink>
      </div>
    </div>
  );
}
