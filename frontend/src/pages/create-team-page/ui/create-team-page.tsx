import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
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
      
      const userId = AuthService.getUserId();
      if (!userId) {
        setError("Пользователь не авторизован");
        return;
      }

      const team = await HackmateApi.createTeam(parseInt(id), {
        name: teamName.trim(),
        captain_id: userId,
      });
      
      navigate(`/hackathons/${id}/teams/${team.id}`);

      navigate(`/hackathons/${id}/teams`);
    } catch (err: any) {
      console.error("Ошибка создания команды:", err);
      setError(
        err.response?.data?.message ||
        "Не удалось создать команду. Пожалуйста, попробуйте позже."
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

