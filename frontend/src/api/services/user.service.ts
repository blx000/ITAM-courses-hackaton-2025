import api from "../config/axios.config";
import type { User, TeamShort, UserUpdate } from "../types";

export const UserService = {
  getCurrentUser: () =>
    api.get<User>("/api/user").then((resp) => resp.data),
  getUser: (userId: number) =>
    api.get<User>(`/api/users/${userId}`).then((resp) => resp.data),
  getUserTeams: (userId: number) =>
    api.get<TeamShort[]>(`/api/users/${userId}/teams`).then((resp) => resp.data),
  updateUser: (data: UserUpdate) =>
    api.patch<{ access_token: string }>("/api/user", data).then((resp) => resp.data),
};