import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import { useApp } from "../../../shared/context";
import type { Role } from "../../../api";
import { ProfileHeader } from "../../../modules/profile-header";
import { Navigation } from "../../../modules/navigation";
import styles from "./create-team-page.module.css";
import bgImage from "/bg-image2.png";
import teamPhoto from "/team-photo.svg";
import addIcon from "/add-icon.svg";

export function CreateTeamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roles: availableRoles, loading: appLoading } = useApp();
  const [teamName, setTeamName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const handleAddRole = () => {
    if (!selectedRoleId) return;

    const roleId = parseInt(selectedRoleId);
    const role = availableRoles.find((r) => r.id === roleId);

    if (role && !selectedRoles.find((r) => r.id === role.id)) {
      setSelectedRoles([...selectedRoles, role]);
      setSelectedRoleId(""); // Сброс выбора
    }
  };

  const handleRemoveRole = (roleId: number) => {
    setSelectedRoles(selectedRoles.filter((r) => r.id !== roleId));
  };

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
        role_ids: selectedRoles.map((r) => r.id),
      });

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
      <ProfileHeader title="Создать команду" />
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.teamPhotoContainer}>
          <img src={teamPhoto} alt="Team" className={styles.teamPhoto} />
        </div>

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

          <div className={styles.inputGroup}>
            <label className={styles.label}>Кого ищем:</label>
            {appLoading.roles ? (
              <div className={styles.loadingText}>Загрузка ролей...</div>
            ) : (
              <>
                <div className={styles.roleSelector}>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className={styles.roleSelect}
                    disabled={loading}
                  >
                    <option value="">Выберите роль</option>
                    {availableRoles
                      .filter(
                        (role) => !selectedRoles.find((r) => r.id === role.id)
                      )
                      .map((role) => (
                        <option key={role.id} value={role.id.toString()}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className={styles.addRoleButton}
                    disabled={loading || !selectedRoleId}
                  >
                    <img src={addIcon} alt="add" />
                  </button>
                </div>
                {selectedRoles.length > 0 && (
                  <div className={styles.selectedRolesList}>
                    {selectedRoles.map((role) => (
                      <div key={role.id} className={styles.selectedRoleItem}>
                        <span className={styles.selectedRoleName}>
                          {role.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role.id)}
                          className={styles.removeRoleButton}
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Дополнительная информация:</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => {
                setAdditionalInfo(e.target.value);
                setError(null);
              }}
              placeholder="Расскажите о команде, какие участники вам нужны..."
              className={styles.textarea}
              disabled={loading}
              maxLength={500}
              rows={4}
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
      <Navigation />
    </div>
  );
}
