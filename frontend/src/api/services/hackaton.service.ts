import api from "../config/axios.config";
import type { HackathonShort, HackathonPage, HackCreate, FormCreate, Team, Participant } from "../types";

export const HackathonService = {
  getHackathons: () =>
    api.get<HackathonShort[]>("/api/hacks").then((resp) => resp.data),
  getHackathon: (hackId: number) =>
    api.get<HackathonPage>(`/api/hacks/${hackId}`).then((resp) => resp.data),
  createHackathon: (hackData: HackCreate) =>
    api.post<void>("/api/admin/hacks", hackData).then((resp) => resp.data),
  enterHackathon: (hackId: number, formData: FormCreate) =>
    api.post<void>(`/api/hacks/${hackId}/enter`, formData).then((resp) => resp.data),
  getHackathonTeams: (hackId: number) =>
    api.get<Team[]>(`/api/hacks/${hackId}/teams`).then((resp) => resp.data),
  getHackathonParticipants: (hackId: number) =>
    api.get<Participant[]>(`/api/hacks/${hackId}/participants`).then((resp) => resp.data),
  getParticipant: (hackId: number, participantId: number) =>
    api.get<Participant>(`/api/hacks/${hackId}/participants/${participantId}`)
      .then((resp) => resp.data),
};