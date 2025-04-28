
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MemberDataResult } from './types';
import { useTeamMemberPermissions } from './useTeamMemberPermissions';

export function useRemoveTeamMember() {
  const { toast } = useToast();
  const { checkTeamAdminRights } = useTeamMemberPermissions();

  const removeTeamMember = async (teamId: string, memberId: string, fetchTeamMembers: (teamId: string) => Promise<void>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const hasAdminRights = await checkTeamAdminRights(teamId, userData.user.id);
      if (!hasAdminRights) {
        throw new Error('You need admin privileges to remove team members');
      }
      
      const { data: memberData, error: getMemberError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('id', memberId)
        .returns<MemberDataResult[]>();

      if (getMemberError) throw getMemberError;
      if (!memberData || memberData.length === 0) throw new Error('Team member not found');

      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;

      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'remove_team_member',
          entity_type: 'team_members',
          entity_id: teamId,
          details: { removed_user_id: memberData[0].user_id }
        });

      await fetchTeamMembers(teamId);
      
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove team member',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { removeTeamMember };
}
