import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { User, Role, Skill, Participant } from "../../../api";
import styles from "./profile-edit-page.module.css";
import bgImage from "/bg-image2.png";
import profilePhoto from "/profile-photo.svg";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [, setParticipantData] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userData, rolesData, skillsData] = await Promise.all([
        HackmateApi.getCurrentUser(),
        HackmateApi.getRoles(),
        HackmateApi.getSkills(),
      ]);

      setUser(userData);
      setFirstName(userData.first_name || "");
      setLastName(userData.last_name || "");
      setBio(userData.bio || "");
      setRoles(rolesData);
      setSkills(skillsData);

      // Загружаем данные участника для получения роли и стека
      const userId = AuthService.getUserId();
      if (userId) {
        try {
          const hackathons = await HackmateApi.getHackathons();
          for (const hackathon of hackathons) {
            try {
              const participant = await HackmateApi.getParticipant(
                hackathon.id,
                userId
              );
              setParticipantData(participant);
              setSelectedRole(participant.role || null);
              setSelectedSkills(participant.skills || []);
              break;
            } catch (err) {
              // Продолжаем поиск
            }
          }
        } catch (err) {
          console.error("Ошибка загрузки данных участника:", err);
        }
      }
    } catch (err: any) {
      console.error("Ошибка загрузки данных:", err);
      setError(
        err.response?.status === 401
          ? "Необходимо войти в систему"
          : "Не удалось загрузить данные"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skillId = parseInt(e.target.value);
    if (!skillId) return;

    const skill = skills.find((s) => s.id === skillId);
    if (skill && !selectedSkills.find((s) => s.id === skillId)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills(selectedSkills.filter((s) => s.id !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Имя и фамилия обязательны для заполнения");
      setSaving(false);
      return;
    }

    try {
      // Обновляем профиль пользователя
      const updatedUser = await HackmateApi.updateUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim() || undefined,
      });

      setUser(updatedUser);
      setSuccess(true);

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err: any) {
      console.error("Ошибка сохранения:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Не удалось сохранить изменения"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.profilePhotoContainer}>
          <img src={profilePhoto} alt="profile-photo" />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && (
            <div className={styles.success}>
              Профиль успешно обновлен! Перенаправление...
            </div>
          )}

          <div className={styles.usernameDisplay}>
            <strong>Телеграм:</strong> @{user?.login || "username"}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия"
              className={styles.input}
              disabled={saving}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя"
              className={styles.input}
              disabled={saving}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <select
              value={selectedRole?.id || ""}
              onChange={(e) => {
                const role = roles.find(
                  (r) => r.id === parseInt(e.target.value)
                );
                setSelectedRole(role || null);
              }}
              className={styles.input}
              disabled={saving}
            >
              <option value="">Основная роль</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.skillsSection}>
            <h2 className={styles.sectionTitle}>Стек:</h2>

            {selectedSkills.map((skill) => (
              <div key={skill.id} className={styles.skillInput}>
                <input
                  type="text"
                  value={skill.name}
                  readOnly
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className={styles.removeButton}
                  disabled={saving}
                >
                  ×
                </button>
              </div>
            ))}

            <select
              value=""
              onChange={handleSkillSelect}
              className={styles.input}
              disabled={saving}
            >
              <option value="">Выберите навык</option>
              {skills
                .filter(
                  (skill) => !selectedSkills.find((s) => s.id === skill.id)
                )
                .map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Дополнительная информация:"
              className={styles.textarea}
              disabled={saving}
            />
          </div>

          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}
