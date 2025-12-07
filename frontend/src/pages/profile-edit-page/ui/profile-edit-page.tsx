import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HackmateApi, AuthService } from "../../../api";
import type { User, Role, Skill, Participant } from "../../../api";
import styles from "./profile-edit-page.module.css";
import bgImage from "/bg-image2.png";
import profilePhoto from "/profile-photo.svg";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [participantData, setParticipantData] = useState<Participant | null>(
    null
  );
  const [hackathonId, setHackathonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [experience, setExperience] = useState<string>("");
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
      setUsername(userData.username || userData.login || "");
      setRoles(rolesData);
      setSkills(skillsData);
      if (userData) {
        try {
          const hackathons = await HackmateApi.getHackathons();
          for (const hackathon of hackathons) {
            try {
              const participants = await HackmateApi.getHackathonParticipants(
                hackathon.id
              );
              const userParticipant = participants.find(
                (p: Participant) =>
                  p.first_name === userData.first_name &&
                  p.last_name === userData.last_name
              );

              if (userParticipant) {
                setParticipantData(userParticipant);
                setHackathonId(hackathon.id);
                setSelectedRole(userParticipant.role || null);
                setSelectedSkills(userParticipant.skills || []);
                if (
                  userParticipant.experience !== undefined &&
                  userParticipant.experience !== null
                ) {
                  setExperience(userParticipant.experience.toString());
                }
                setBio(userParticipant.add_info || userData.bio || "");
                break;
              }
            } catch (err) {
              console.error(
                `Ошибка загрузки участников для хакатона ${hackathon.id}:`,
                err
              );
            }
          }
          if (!participantData) {
            setBio(userData.bio || "");
          }
        } catch (err) {
          console.error("Ошибка загрузки данных участника:", err);
          // В случае ошибки используем bio пользователя
          setBio(userData.bio || "");
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
      const response = await HackmateApi.updateUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        bio: bio.trim() || undefined,
        username: username.trim() || undefined,
      });
      if (response.access_token) {
        AuthService.setTokens({
          access_token: response.access_token,
          refresh_token: AuthService.getRefreshToken() || "",
        });
      }
      const updatedUser = await HackmateApi.getCurrentUser();
      setUser(updatedUser);
      if (participantData && hackathonId) {
        try {
          const hackId =
            typeof hackathonId === "number"
              ? hackathonId
              : parseInt(String(hackathonId));
          const partId =
            typeof participantData.id === "number"
              ? participantData.id
              : parseInt(String(participantData.id));

          if (isNaN(hackId) || isNaN(partId)) {
            throw new Error(
              `Неверные ID: hackathonId=${hackathonId}, participantId=${participantData.id}`
            );
          }

          const updateData: {
            role_id?: number;
            skill_ids?: number[];
            experience?: number;
            additional_info?: string;
          } = {};

          if (selectedRole?.id) {
            updateData.role_id = selectedRole.id;
          }
          updateData.skill_ids =
            selectedSkills.length > 0 ? selectedSkills.map((s) => s.id) : [];
          if (experience && experience.trim() !== "") {
            const expValue = parseInt(experience);
            if (!isNaN(expValue) && expValue >= 0) {
              updateData.experience = expValue;
            }
          }
          updateData.additional_info = bio.trim() || "";

          console.log("Обновление участника:", { hackId, partId, updateData });
          await HackmateApi.updateParticipant(hackId, partId, updateData);
          console.log("Данные участника успешно обновлены:", updateData);
        } catch (err: any) {
          console.error("Ошибка обновления данных участника:", err);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Не удалось обновить данные участника"
          );
          setSaving(false);
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/profile", {
          replace: true,
          state: {
            refresh: Date.now(),
            participantId: participantData?.id,
            hackathonId,
          },
        });
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

          <div className={styles.inputGroup}>
            <label className={styles.label}>Тег tg:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Телеграм тег (без @)"
              className={styles.input}
              disabled={true}
              readOnly
              title="Телеграм тег нельзя изменить"
            />
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
            <label className={styles.label}>Основная роль:</label>
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
              <option value="">Выберите роль</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Опыт участия в хакатонах:</label>
            <input
              type="number"
              min="0"
              value={experience}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  setExperience(value);
                }
              }}
              placeholder="0"
              className={styles.input}
              disabled={saving}
            />
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
