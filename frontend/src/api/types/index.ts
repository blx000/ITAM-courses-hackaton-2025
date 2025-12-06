export type Health = {
  resp: string;
}
export type UserLogin = {
  code: string;
}
export type AdminLogin = {
  login: string;
  password: string;
}
export type Token = {
  access_token: string;
  refresh_token: string;
}
export type HackCreate = {
  name: string;
  description: string;
  prize: number;
  start_date: string; 
  end_date: string; 
  max_team_size: number;
}
export type HackathonPage = {
  id: number;
  name: string;
  description: string;
  max_team_size: number;
  prize: number;
  start_date: string;
  end_date: string;
}
export type HackathonShort = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}
export type User = {
  id: number;
  first_name: string;
  last_name: string;
  bio: string;
  is_admin?: boolean;
  login?: string;
}
export type Participant = {
  id: number;
  first_name: string;
  last_name: string;
  role: Role;
  skills: Skill[];
  team_id: number;
}
export type Team = {
  id: number;
  name: string;
  captain_id: number;
  members: Participant[];
  max_size: number;
}
export type TeamShort = {
  id: number;
  name: string;
  hack_id: number;
  hack_name: string;
  max_size: number;
}
export type TeamCreate = {
  name: string;
  captain_id: number;
}
export type Role = {
  id: number;
  name: string;
}
export type Skill = {
  id: number;
  name: string;
}
export type FormCreate = {
  role: Role;
  skills: Skill[];
  additional_info: string;
  experience: number;
}
export type Request = {
  id: number;
  team_id: number;
}
export type Invite = {
  id: number;
  team_id: number;
  participant_id?: number;
  participant?: Participant;
}