import { useState } from "react";
import { useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import styles from "./admin-login-page.module.css";
import bgImage from "/bg-image.png";

export function AdminLoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!login.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      setLoading(false);
      return;
    }

    try {
      const tokens = await HackmateApi.loginAdmin(login, password);
      AuthService.setTokens(tokens);

      const user = await HackmateApi.getCurrentUser();
      AuthService.setUserId(Number(user.id));

      if (!user.is_admin) {
        setError("Доступ запрещен. Вы не являетесь администратором.");
        AuthService.clearTokens();
        setLoading(false);
        return;
      }

      navigate("/admin");
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Неверные учетные данные. Пожалуйста, проверьте логин и пароль."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.loginForm}>
          <div className={styles.header}>
            <h2 className={styles.title}>Вход для администратора</h2>
            <p className={styles.subtitle}>
              Введите логин и пароль для доступа к панели управления
            </p>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              value={login}
              onChange={(e) => {
                setLogin(e.target.value);
                setError(null);
              }}
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="Логин"
              disabled={loading}
              autoComplete="username"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="Пароль"
              disabled={loading}
              autoComplete="current-password"
            />
            {error && <div className={styles.error}>{error}</div>}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !login.trim() || !password.trim()}
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/login")}
          >
            Вернуться к обычному входу
          </button>
        </div>
      </div>
    </div>
  );
}



