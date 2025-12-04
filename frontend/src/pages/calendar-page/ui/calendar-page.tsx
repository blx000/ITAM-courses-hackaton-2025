import styles from "./calendar-page.module.css";
import { Calendar } from "../../../modules/calendar";

export function CalendarPage() {
  return (
    <div className={styles.container}>
      <div className={styles.options}>
        <div className={styles.item}>Неделя</div>
        <div className={styles.item}>Месяц</div>
        <div className={styles.item}>Год</div>
      </div>
      <Calendar />
      <div className={styles.hacks}>
        <h2>Предстоящие хакатоны</h2>
      </div>
    </div>
  );
}
