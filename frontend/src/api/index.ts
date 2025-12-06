export type {Health, UserLogin, AdminLogin, Token, HackCreate, HackathonPage, HackathonShort, User, Participant, Team, TeamShort, TeamCreate, Role, Skill, FormCreate, Request, Invite} from "./types";
export { AuthService } from "./services/auth.service";
export { CommonService } from "./services/common.service";
export { UserService } from "./services/user.service";
export { HackathonService } from "./services/hackaton.service";
export { TeamService } from "./services/team.service";
export { default as api } from "./config/axios.config";

import { AuthService } from "./services/auth.service";
import { CommonService } from "./services/common.service";
import { UserService } from "./services/user.service";
import { HackathonService } from "./services/hackaton.service";
import { TeamService } from "./services/team.service";

export const HackmateApi = {
  loginUser: AuthService.loginUser,
  loginAdmin: AuthService.loginAdmin,
  
  healthCheck: CommonService.healthCheck,
  getRoles: CommonService.getRoles,
  getSkills: CommonService.getSkills,

  getCurrentUser: UserService.getCurrentUser,
  getUser: UserService.getUser,
  getUserTeams: UserService.getUserTeams,

  getHackathons: HackathonService.getHackathons,
  getHackathon: HackathonService.getHackathon,
  createHackathon: HackathonService.createHackathon,
  enterHackathon: HackathonService.enterHackathon,
  getHackathonTeams: HackathonService.getHackathonTeams,
  getHackathonParticipants: HackathonService.getHackathonParticipants,
  getParticipant: HackathonService.getParticipant,

  createTeam: TeamService.createTeam,
  getTeam: TeamService.getTeam,
  requestToJoinTeam: TeamService.requestToJoin,
  getTeamRequests: TeamService.getTeamRequests,
  acceptRequest: TeamService.acceptRequest,
  inviteParticipant: TeamService.inviteParticipant,
  getInvitations: TeamService.getInvitations,
  acceptInvitation: TeamService.acceptInvitation,
};