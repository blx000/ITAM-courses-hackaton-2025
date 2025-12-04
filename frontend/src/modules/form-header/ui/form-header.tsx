import styles from "./form-header.module.css";
import questionIcon from "/question-icon.svg";
import bellIcon from "/bell-icon.svg";

export function FormHeader() {
  return (
    <div className={styles.container}>
      <h1>Расскажи о себе</h1>
      <div className={styles.icons}>
        <img src={questionIcon} alt="question-icon" />
        <img src={bellIcon} alt="bell-icon" />
      </div>
    </div>
  );
}
