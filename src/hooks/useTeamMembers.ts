
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  joined_at: string;
}

interface AddMemberParams {
  teamId: string;
  email: string;
  role: string;
}

// Define a proper type for the user settings query result
interface UserSettingsWithEmail {
  user_id: string;
  email?: string;
}

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();

  const checkTeamAdminRights = async (teamId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId);
      
      if (error || !data || data.length === 0) return false;
      
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('is_admin')
        .eq('user_id', userId)
        .single();
      
      return data[0]?.role === 'admin' || userSettings?.is_admin;
    } catch {
      return false;
    }
  };

  const fetchTeamMembers = useCallback(async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const addTeamMember = async ({ teamId, email, role }: AddMemberParams) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const hasAdminRights = await checkTeamAdminRights(teamId, userData.user.id);
      if (!hasAdminRights) {
        throw new Error('You need admin privileges to add team members');
      }

      // Use a type assertion to avoid the deep instantiation error
      const userQuery = await supabase
        .from('user_settings')
        .select('user_id')
        .eq('email', email);
        
      // Extract data and error from the query result
      const { data, error } = userQuery;

      if (error) throw error;
      
      if (!data || data.length === 0) {
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
          user_id: data[0].user_id,
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

  const removeTeamMember = async (teamId: string, memberId: string) => {
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
        .eq('id', memberId);

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

  return {
    teamMembers,
    fetchTeamMembers,
    addTeamMember,
    removeTeamMember
  };
}
