import api from "../config/axios.config";
import type { User, TeamShort } from "../types";

export const UserService = {
  getUser: (userId: number) =>
    api.get<User>(`/api/users/${userId}`).then((resp) => resp.data),
  getUserTeams: (userId: number) =>
    api.get<TeamShort[]>(`/api/users/${userId}/teams`).then((resp) => resp.data),
};