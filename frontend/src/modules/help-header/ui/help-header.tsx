import styles from "./help-header.module.css";
import questionIcon from "/question-icon.svg";
import bellIcon from "/bell-icon.svg";

export function HelpHeader() {
  return (
    <div className={styles.container}>
      <h1>Подсказки</h1>
      <div className={styles.icons}>
        <img src={questionIcon} alt="question-icon" />
        <img src={bellIcon} alt="bell-icon" />
      </div>
    </div>
  );
}
