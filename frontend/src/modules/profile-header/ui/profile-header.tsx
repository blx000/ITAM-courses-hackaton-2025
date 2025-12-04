import styles from "./profile-header.module.css";
import questionIcon from "/question-icon.svg";
import bellIcon from "/bell-icon.svg";

export function ProfileHeader() {
  return (
    <div className={styles.container}>
      <h1>Мой профиль</h1>
      <div className={styles.icons}>
        <img src={questionIcon} alt="question-icon" />
        <img src={bellIcon} alt="bell-icon" />
      </div>
    </div>
  );
}
