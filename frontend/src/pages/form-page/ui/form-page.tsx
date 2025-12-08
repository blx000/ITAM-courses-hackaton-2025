import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { HackmateApi } from "../../../api";
import type { Role, Skill, FormCreate } from "../../../api";
import styles from "./form-page.module.css";
import bgImage from "/bg-image.png";

export function FormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hackathonId = id
    ? parseInt(id)
    : parseInt(searchParams.get("hackathon") || "0");

  const [roles, setRoles] = useState<Role[]>([]);
  const [, setSkills] = useState<Skill[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesData, skillsData] = await Promise.all([
        HackmateApi.getRoles(),
        HackmateApi.getSkills(),
      ]);
      setRoles(rolesData);
      setSkills(skillsData);
      setAvailableSkills(skillsData);
    } catch (err: any) {
      console.error("Ошибка загрузки данных:", err);
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = parseInt(e.target.value);
    const role = roles.find((r) => r.id === roleId);
    setSelectedRole(role || null);
  };

  const handleSkillSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skillId = parseInt(e.target.value);
    if (!skillId) return;

    const skill = availableSkills.find((s) => s.id === skillId);
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

    if (!hackathonId || hackathonId === 0) {
      setError("Не указан ID хакатона");
      return;
    }

    if (!selectedRole) {
      setError("Пожалуйста, выберите роль");
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Пожалуйста, выберите хотя бы один навык");
      return;
    }

    if (!experience || experience.trim() === "") {
      setError("Пожалуйста, укажите опыт участия в хакатонах");
      return;
    }

    const experienceNum = parseInt(experience);
    if (isNaN(experienceNum) || experienceNum < 0) {
      setError("Опыт должен быть положительным числом");
      return;
    }

    if (!additionalInfo.trim()) {
      setError("Пожалуйста, заполните дополнительную информацию");
      return;
    }

    try {
      setSubmitting(true);

      const formData: FormCreate = {
        role: selectedRole,
        skills: selectedSkills,
        additional_info: additionalInfo.trim(),
        experience: experienceNum,
      };

      console.log("Отправка формы:", formData);
      await HackmateApi.enterHackathon(hackathonId, formData);
      setSuccess(true);

      setTimeout(() => {
        navigate(`/hackathons/${hackathonId}/participants`);
      }, 1500);
    } catch (err: any) {
      console.error("Ошибка отправки формы:", err);
      console.error("Детали ошибки:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      
      let errorMessage = "Не удалось отправить форму. Пожалуйста, проверьте данные и попробуйте снова.";
      
      if (err.response?.status === 409) {
        errorMessage = "Вы уже присоединились к этому хакатону. Перенаправление...";
        setTimeout(() => {
          navigate(`/hackathons/${hackathonId}/participants`);
        }, 1500);
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Неверные данные формы. Проверьте все поля.";
      } else if (err.response?.status === 401) {
        errorMessage = "Необходима авторизация. Пожалуйста, войдите в систему.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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
      <div className={styles.content}>
        <form onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>
            Анкета успешно создана! Перенаправление...
          </div>
        )}

        <div className={styles.inputGroup}>
          <h2>Роль:</h2>
          <select
            value={selectedRole?.id || ""}
            onChange={handleRoleChange}
            required
            disabled={submitting}
            className={styles.select}
          >
            <option value="" disabled>
              Выберите роль
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.stack}>
          <h2>Стек:</h2>
          <div className={styles.skillsContainer}>
            {selectedSkills.map((skill) => (
              <div key={skill.id} className={styles.skillChip}>
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className={styles.removeSkill}
                  disabled={submitting}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.inputGroup}>
            <select 
              value="" 
              onChange={handleSkillSelect} 
              disabled={submitting}
              className={styles.select}
            >
              <option value="" disabled>
                Выберите навык
              </option>
              {availableSkills
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
        </div>

        <div className={styles.inputGroup}>
          <h2>Опыт (количество хакатонов):</h2>
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
            required
            disabled={submitting}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <h2>Дополнительная информация:</h2>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Расскажите о себе..."
            required
            disabled={submitting}
            className={styles.textarea}
          />
        </div>

        <button
          className={styles.createBtn}
          type="submit"
          disabled={submitting || !selectedRole || selectedSkills.length === 0 || !additionalInfo.trim() || !experience.trim()}
        >
          {submitting ? "Создание..." : "Создать анкету"}
        </button>
      </form>
      </div>
    </div>
  );
}
