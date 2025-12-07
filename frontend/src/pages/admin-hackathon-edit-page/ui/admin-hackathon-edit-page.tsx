import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { HackmateApi } from "../../../api";
import { useApp } from "../../../shared/context/app-context";
import type { HackCreate, HackathonPage } from "../../../api";
import styles from "./admin-hackathon-edit-page.module.css";
import bgImage from "/admin-bg1.png";
import hackathonIcon from "/hackathon-photo.svg";
import adminIcon from "/admin-icon.svg";

export function AdminHackathonEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshHackathons } = useApp();
  const [formData, setFormData] = useState<HackCreate>({
    name: "",
    description: "",
    prize: 0,
    start_date: "",
    end_date: "",
    max_team_size: 5,
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("ID хакатона не указан");
      setLoadingData(false);
      return;
    }
    loadHackathon();
  }, [id]);

  const loadHackathon = async () => {
    if (!id) return;

    try {
      setLoadingData(true);
      setError(null);
      const hackathonId = parseInt(id);
      const hackathon: HackathonPage = await HackmateApi.getHackathon(
        hackathonId
      );
      const startDate = new Date(hackathon.start_date)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(hackathon.end_date).toISOString().split("T")[0];

      setFormData({
        name: hackathon.name,
        description: hackathon.description,
        prize: hackathon.prize || 0,
        start_date: startDate,
        end_date: endDate,
        max_team_size: hackathon.max_team_size,
      });
    } catch (err: any) {
      console.error("Error loading hackathon:", err);
      setError("Не удалось загрузить данные хакатона");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError(null);
    setLoading(true);

    if (!formData.name.trim() || !formData.description.trim()) {
      setError("Пожалуйста, заполните все обязательные поля");
      setLoading(false);
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError("Пожалуйста, укажите даты начала и окончания");
      setLoading(false);
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError("Дата окончания должна быть позже даты начала");
      setLoading(false);
      return;
    }

    try {
      const hackathonId = parseInt(id);
      const hackData: HackCreate = {
        ...formData,
        start_date: formData.start_date,
        end_date: formData.end_date,
        prize: formData.prize || 0,
      };
      await HackmateApi.updateHackathon(hackathonId, hackData);
      await refreshHackathons();
      navigate(`/admin/hackathons/${hackathonId}?refresh=${Date.now()}`, {
        replace: false,
      });
    } catch (err: any) {
      console.error("Error updating hackathon:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Не удалось обновить хакатон. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setDeleting(true);
    setError(null);

    try {
      const hackathonId = parseInt(id);
      await HackmateApi.deleteHackathon(hackathonId);
      await refreshHackathons();
      navigate("/admin");
    } catch (err: any) {
      console.error("Error deleting hackathon:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Не удалось удалить хакатон. Пожалуйста, попробуйте позже."
      );
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "prize" || name === "max_team_size") {
      const numValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numValue ? parseInt(numValue, 10) : 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loadingData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage}>
        <img src={bgImage} alt="background" />
      </div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img src={adminIcon} alt="Admin" className={styles.adminIcon} />
          <span className={styles.adminText}>
            Hack <span>Mate</span> admin
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.mainBlock}>
            <div className={styles.iconContainer}>
              <img
                src={hackathonIcon}
                alt="hackathon"
                className={styles.formIcon}
              />
            </div>
            <div className={styles.fieldsContainer}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Название</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Введите название хакатона"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Призовой фонд (₽)</label>
                <input
                  type="number"
                  name="prize"
                  value={formData.prize}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Дата начала</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Дата окончания</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className={styles.input}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Максимальный размер команды
                </label>
                <input
                  type="number"
                  name="max_team_size"
                  value={formData.max_team_size}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="5"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className={styles.additionalBlock}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Дополнительная информация</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Введите описание хакатона"
                rows={4}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || deleting}
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() =>
                navigate(id ? `/admin/hackathons/${id}` : "/admin")
              }
              disabled={loading || deleting}
            >
              Отмена
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || deleting}
            >
              Удалить
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalContent}>
              <h3 className={styles.deleteModalTitle}>Удалить хакатон?</h3>
              <p className={styles.deleteModalText}>
                Вы уверены, что хотите удалить этот хакатон? Это действие нельзя
                отменить.
              </p>
              <div className={styles.deleteModalActions}>
                <button
                  className={styles.deleteConfirmButton}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Удаление..." : "Удалить"}
                </button>
                <button
                  className={styles.deleteCancelButton}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
