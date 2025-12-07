import api from "../config/axios.config";
import type { HackathonShort, HackathonPage, HackCreate, FormCreate, Team, Participant } from "../types";

export const HackathonService = {
  getHackathons: () =>
    api.get<HackathonShort[]>("/api/hacks").then((resp) => resp.data),
  getHackathon: (hackId: number) =>
    api.get<HackathonPage>(`/api/hacks/${hackId}`).then((resp) => resp.data),
  createHackathon: (hackData: HackCreate) =>
    api.post<void>("/api/admin/hacks", hackData).then((resp) => resp.data),
  updateHackathon: (hackId: number, hackData: HackCreate) =>
    api.patch<HackathonShort>(`/api/admin/hacks/${hackId}`, hackData).then((resp) => resp.data),
  enterHackathon: (hackId: number, formData: FormCreate) =>
    api.post<void>(`/api/hacks/${hackId}/enter`, formData).then((resp) => resp.data),
  getHackathonTeams: (hackId: number) =>
    api.get<Team[]>(`/api/hacks/${hackId}/teams`).then((resp) => resp.data),
  getHackathonParticipants: (hackId: number) =>
    api.get<Participant[]>(`/api/hacks/${hackId}/participants`).then((resp) => resp.data),
  getParticipant: (hackId: number, participantId: number) =>
    api.get<Participant>(`/api/hacks/${hackId}/participants/${participantId}`)
      .then((resp) => resp.data),
  updateParticipant: (hackId: number, participantId: number, data: {
    role_id?: number;
    skill_ids?: number[];
    experience?: number;
    additional_info?: string;
  }) => {
    const hackIdNum = Number(hackId);
    const partIdNum = Number(participantId);
    
    if (isNaN(hackIdNum) || isNaN(partIdNum)) {
      return Promise.reject(new Error(`Invalid IDs: hackId=${hackId}, participantId=${participantId}`));
    }
    
    const url = `/api/hacks/${hackIdNum}/participants/${partIdNum}`;
    console.log("Update participant URL:", url);
    
    return api.patch<void>(url, data)
      .then((resp) => resp.data);
  },
};