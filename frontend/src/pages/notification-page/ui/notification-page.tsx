import styles from "./notification-page.module.css";
import { Navigation } from "../../../modules/navigation";
import bgImage from "/bg-image.png";

export function NotificationPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.content}>
        <div className={styles.message}>
          <h2 className={styles.messageTitle}>Страница в разработке</h2>
          <p className={styles.messageText}>
            Скоро здесь появятся все ваши уведомления о приглашениях в команды,
            заявках и других важных событиях.
          </p>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
