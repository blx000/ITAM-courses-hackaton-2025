import styles from "./form-page.module.css";
import addIcon from "/add-icon.svg";

export function FormPage() {
  return (
    <div className={styles.container}>
      <form action="">
        <div className={styles.item}>
          <h2>Фамилия:</h2> <input type="text" />
        </div>
        <div className={styles.item}>
          <h2>Имя:</h2> <input type="text" />
        </div>
        <div className={styles.item}>
          Роль:{" "}
          <select name="" id="">
            <option value="" disabled>
              Выберете роль
            </option>
            <option value="">234rt5y</option>
            <option value="">236</option>
          </select>
        </div>
        <div className={styles.stack}>
          <h2>Стек:</h2>
          <div className={styles.item}>
            <select name="" id="">
              <option value="" disabled>
                Выберете стек
              </option>
              <option value="">234rt5y</option>
              <option value="">236</option>
            </select>
          </div>
          <div className={styles.item}>
            <select name="" id="">
              <option value="" disabled>
                Выберете стек
              </option>
              <option value="">234rt5y</option>
              <option value="">236</option>
            </select>
          </div>
          <img src={addIcon} alt="add-icon" />
        </div>
        <div className={styles.item}>
          Опыт: <input type="text" />
        </div>
        <div className={`${styles.item} ${styles.addInfo}`}>
          <h2>Дополнительная информация:</h2>
          <textarea name="" id=""></textarea>
        </div>
        <button type="submit">Создать анкету</button>
      </form>
    </div>
  );
}
