import styles from "./form-header.module.css";
import questionIcon from "/question-icon.svg";
import bellIcon from "/bell-icon.svg";
import { NavLink } from "react-router";

export function FormHeader() {
  return (
    <div className={styles.container}>
      <h1>Расскажи о себе</h1>
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
