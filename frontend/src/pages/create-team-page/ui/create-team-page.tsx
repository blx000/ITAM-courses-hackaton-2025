import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import styles from "./create-team-page.module.css";
import bgImage from "/bg-image.png";

export function CreateTeamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError("Пожалуйста, введите название команды");
      return;
    }

    if (!id) {
      setError("ID хакатона не указан");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await HackmateApi.createTeam(parseInt(id), {
        name: teamName.trim(),
      });

      // После создания команды перенаправляем на страницу участников
      navigate(`/hackathons/${id}/participants`);
    } catch (err: any) {
      console.error("Ошибка создания команды:", err);
      console.error("Детали ошибки:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      let errorMessage =
        "Не удалось создать команду. Пожалуйста, попробуйте позже.";

      if (err.response?.status === 400) {
        errorMessage = "Неверные данные. Проверьте название команды.";
      } else if (err.response?.status === 401) {
        errorMessage = "Необходима авторизация. Пожалуйста, войдите в систему.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Назад
        </button>

        <h1 className={styles.title}>Создать команду</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Название команды:</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setError(null);
              }}
              placeholder="Введите название команды"
              className={styles.input}
              disabled={loading}
              maxLength={100}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !teamName.trim()}
          >
            {loading ? "Создание..." : "Создать команду"}
          </button>
        </form>
      </div>
    </div>
  );
}
