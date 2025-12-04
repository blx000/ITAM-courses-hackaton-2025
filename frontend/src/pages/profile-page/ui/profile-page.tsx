import styles from "./profile-page.module.css";
import profileIcon from "/profile-photo.svg";

export function ProfilePage() {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <img src={profileIcon} alt="profile-photo" />
        <div className={styles.textBox}>
          <h2 className={styles.surname}>Фамилия</h2>
          <h2 className={styles.name}>Имя</h2>
          <h3 className={styles.experience}>Опыт в хакатонах</h3>
          <h3 className={styles.role}>Основная роль: </h3>
        </div>
      </div>
      <div className={styles.phone}>Телеграмм: </div>
      <div className={styles.stack}>
        <h2>Стек:</h2>
      </div>
      <div className={styles.addBox}>
        <h2>Дополнительная информация: </h2>
        <div className={styles.text}></div>
      </div>
    </div>
  );
}
