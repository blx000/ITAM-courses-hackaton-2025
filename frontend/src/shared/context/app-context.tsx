import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { HackmateApi, AuthService } from "../../api";
import type { User, HackathonShort, Role, Skill } from "../../api";

interface AppContextType {
  user: User | null;
  hackathons: HackathonShort[];
  roles: Role[];
  skills: Skill[];
  loading: {
    user: boolean;
    hackathons: boolean;
    roles: boolean;
    skills: boolean;
  };
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshHackathons: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  refreshSkills: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hackathons, setHackathons] = useState<HackathonShort[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState({
    user: false,
    hackathons: false,
    roles: false,
    skills: false,
  });
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    if (!AuthService.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, user: true }));
      setError(null);
      const userData = await HackmateApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Ошибка загрузки пользователя:", err);
      setError("Не удалось загрузить данные пользователя");
      setUser(null);
    } finally {
      setLoading((prev) => ({ ...prev, user: false }));
    }
  };

  const refreshHackathons = async () => {
    try {
      setLoading((prev) => ({ ...prev, hackathons: true }));
      setError(null);
      const data = await HackmateApi.getHackathons();
      setHackathons(data);
    } catch (err) {
      console.error("Ошибка загрузки хакатонов:", err);
      setError("Не удалось загрузить список хакатонов");
    } finally {
      setLoading((prev) => ({ ...prev, hackathons: false }));
    }
  };

  const refreshRoles = async () => {
    try {
      setLoading((prev) => ({ ...prev, roles: true }));
      setError(null);
      const data = await HackmateApi.getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Ошибка загрузки ролей:", err);
    } finally {
      setLoading((prev) => ({ ...prev, roles: false }));
    }
  };

  const refreshSkills = async () => {
    try {
      setLoading((prev) => ({ ...prev, skills: true }));
      setError(null);
      const data = await HackmateApi.getSkills();
      setSkills(data);
    } catch (err) {
      console.error("Ошибка загрузки навыков:", err);
    } finally {
      setLoading((prev) => ({ ...prev, skills: false }));
    }
  };

  useEffect(() => {
    refreshHackathons();
    refreshRoles();
    refreshSkills();

    if (AuthService.isAuthenticated()) {
      refreshUser();
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        hackathons,
        roles,
        skills,
        loading,
        error,
        refreshUser,
        refreshHackathons,
        refreshRoles,
        refreshSkills,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

