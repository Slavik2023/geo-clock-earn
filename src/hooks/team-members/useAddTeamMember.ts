
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddMemberParams } from './types';
import { useTeamMemberPermissions } from './useTeamMemberPermissions';

export function useAddTeamMember() {
  const { toast } = useToast();
  const { checkTeamAdminRights } = useTeamMemberPermissions();

  const addTeamMember = async (
    { teamId, email, role }: AddMemberParams,
    fetchTeamMembers: (teamId: string) => Promise<void>
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const hasAdminRights = await checkTeamAdminRights(teamId, userData.user.id);
      if (!hasAdminRights) {
        throw new Error('You need admin privileges to add team members');
      }
      
      // Simplify the query completely and avoid type inference
      const settingsQuery = await supabase.rpc('get_user_id_by_email', { email_param: email });
      
      if (settingsQuery.error) throw settingsQuery.error;
      
      // Get the user ID as a simple string value
      const userId = settingsQuery.data;
      
      if (!userId) {
        toast({
          title: 'User not found',
          description: 'User with this email is not registered in the system',
          variant: 'destructive',
        });
        return false;
      }

      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          user_id: userId,
          team_id: teamId,
          role: role,
        });

      if (insertError) throw insertError;

      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'add_team_member',
          entity_type: 'team_members',
          entity_id: teamId,
          details: { member_email: email, role: role }
        });

      await fetchTeamMembers(teamId);
      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add team member',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { addTeamMember };
}
