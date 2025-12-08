import api from "../config/axios.config";
import type { Health, Role, Skill } from "../types";

export const CommonService = {
  healthCheck: () =>
    api.get<Health>("/api/healthcheсk").then((resp) => resp.data),
  getRoles: () =>
    api.get<Role[]>("/api/roles").then((resp) => resp.data),
  getSkills: () =>
    api.get<Skill[]>("/api/skills").then((resp) => resp.data),
};