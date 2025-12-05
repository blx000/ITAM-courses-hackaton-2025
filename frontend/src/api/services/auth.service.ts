import api from "../config/axios.config"
import type { Token } from "../types"
import { Storage_Keys } from "../../shared/config/constants"

export const AuthService = {
  loginUser: (code: string) =>
    api.post<Token>("/api/login", { code }).then((resp) => resp.data),
  loginAdmin: (login: string, password: string) =>
    api.post<Token>("/api/admin/login", { login, password }).then((resp) => resp.data),
  setTokens: (tokens: Token): void => {
    localStorage.setItem(Storage_Keys.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(Storage_Keys.REFRESH_TOKEN, tokens.refresh_token);
  },
  getAccessToken: (): string | null =>
    localStorage.getItem(Storage_Keys.ACCESS_TOKEN),
  getRefreshToken: (): string | null =>
    localStorage.getItem(Storage_Keys.REFRESH_TOKEN),
  clearTokens: (): void => {
    localStorage.removeItem(Storage_Keys.ACCESS_TOKEN);
    localStorage.removeItem(Storage_Keys.REFRESH_TOKEN);
    localStorage.removeItem(Storage_Keys.USER_ID);
  },
  isAuthenticated: (): boolean =>
    !!localStorage.getItem(Storage_Keys.ACCESS_TOKEN),
  setUserId: (userId: number): void => {
    localStorage.setItem(Storage_Keys.USER_ID, userId.toString());
  },
  getUserId: (): number | null => {
    const userId = localStorage.getItem(Storage_Keys.USER_ID);
    return userId ? parseInt(userId, 10) : null;
  },
};