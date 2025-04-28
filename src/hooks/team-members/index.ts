
import { useTeamMemberList } from './useTeamMemberList';
import { useAddTeamMember } from './useAddTeamMember';
import { useRemoveTeamMember } from './useRemoveTeamMember';

export function useTeamMembers() {
  const { teamMembers, fetchTeamMembers } = useTeamMemberList();
  const { addTeamMember } = useAddTeamMember();
  const { removeTeamMember } = useRemoveTeamMember();

  const handleAddTeamMember = async (params: {
    teamId: string;
    email: string;
    role: string;
  }) => {
    return await addTeamMember(params, fetchTeamMembers);
  };

  const handleRemoveTeamMember = async (teamId: string, memberId: string) => {
    return await removeTeamMember(teamId, memberId, fetchTeamMembers);
  };

  return {
    teamMembers,
    fetchTeamMembers,
    addTeamMember: handleAddTeamMember,
    removeTeamMember: handleRemoveTeamMember
  };
}

export type { TeamMember } from './types';
export type { AddMemberParams } from './types';
