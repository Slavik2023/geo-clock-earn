
import { useTeamMembers as useRefactoredTeamMembers } from './team-members';
export type { TeamMember } from './team-members';

export function useTeamMembers() {
  return useRefactoredTeamMembers();
}
