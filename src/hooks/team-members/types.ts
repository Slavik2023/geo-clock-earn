
export type TeamMember = {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  joined_at: string;
}

export type TeamMemberResult = {
  role: string;
};

export type UserSettingAdminResult = {
  is_admin: boolean;
};

export type UserSettingResult = {
  user_id: string;
};

export type MemberDataResult = {
  user_id: string;
};

export interface AddMemberParams {
  teamId: string;
  email: string;
  role: string;
}
