import { useState } from "react";
import { useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import styles from "./login-page.module.css";
import bgImage from "/bg-image.png";

export function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (code.length !== 6) {
      setError("Код должен содержать 6 символов");
      setLoading(false);
      return;
    }

    try {
      const tokens = await HackmateApi.loginUser(code);
      AuthService.setTokens(tokens);

      // Get user info to store user ID
      const user = await HackmateApi.getCurrentUser();
      AuthService.setUserId(Number(user.id));

      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Неверный код авторизации. Пожалуйста, проверьте код и попробуйте снова."
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
            <h2 className={styles.title}>Вход</h2>
            <p className={styles.subtitle}>
              код можно получить в{" "}
              <a
                href="https://t.me/hack_mate_bot"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.botLink}
              >
                @hack_mate_bot
              </a>
            </p>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.slice(0, 6);
                setCode(value);
                setError(null);
              }}
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="______"
              maxLength={6}
              disabled={loading}
              autoComplete="off"
            />
            {error && <div className={styles.error}>{error}</div>}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || code.length !== 6}
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
