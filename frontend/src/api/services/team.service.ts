import api from "../config/axios.config";
import type { Team, TeamCreate, Request, Invite } from "../types";

export const TeamService = {
  createTeam: (hackId: number, teamData: TeamCreate) =>
    api.post<Team[]>(`/api/hacks/${hackId}/teams`, teamData).then((resp) => resp.data),
  getTeam: (hackId: number, teamId: number) =>
    api.get<Team[]>(`/api/hacks/${hackId}/teams/${teamId}`).then((resp) => resp.data),
  requestToJoin: (hackId: number, teamId: number) =>
    api.post<void>(`/api/hacks/${hackId}/teams/${teamId}/request`).then((resp) => resp.data),
  getTeamRequests: (hackId: number) =>
    api.get<Request[]>(`/api/hacks/${hackId}/requests`).then((resp) => resp.data),
  acceptRequest: (hackId: number, requestId: number) =>
    api.post<void>(`/api/hacks/${hackId}/requests/${requestId}/accept`).then((resp) => resp.data),
  inviteParticipant: (hackId: number, participantId: number) =>
    api.post<void>(`/api/hacks/${hackId}/participants/${participantId}/invite`)
      .then((resp) => resp.data),
  getInvitations: (hackId: number) =>
    api.get<Invite[]>(`/api/hacks/${hackId}/invitations`).then((resp) => resp.data),
  acceptInvitation: (hackId: number, inviteId: number) =>
    api.get<void>(`/api/hacks/${hackId}/invitations/${inviteId}/accept`)
      .then((resp) => resp.data),
};