
import { useTeams } from './useTeams';
import { useTeamMembers } from './team-members';
import { useSubscription } from './useSubscription';

export function useTeamManagement() {
  const { teams, isLoading, isAdmin, createTeam, fetchTeams } = useTeams();
  const { teamMembers, fetchTeamMembers, addTeamMember, removeTeamMember } = useTeamMembers();
  const { upgradeSubscription, cancelSubscription } = useSubscription();

  return {
    teams,
    teamMembers,
    isLoading,
    isAdmin,
    createTeam,
    fetchTeams,
    fetchTeamMembers,
    addTeamMember,
    removeTeamMember,
    upgradeSubscription,
    cancelSubscription
  };
}

export type { Team } from './useTeams';
export type { TeamMember } from './team-members';
