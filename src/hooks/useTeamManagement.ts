import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Team {
  id: string;
  company_name: string;
  subscription_plan: string;
  created_at: string;
}

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

// Define a more specific interface for user settings query results
interface UserSettingsRow {
  user_id: string;
  is_admin?: boolean;
  email?: string;
}

export function useTeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if user has admin privileges
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Get user settings to determine admin status
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('is_admin')
        .eq('user_id', userData.user.id);

      if (!settingsError && userSettings && userSettings.length > 0) {
        setIsAdmin(userSettings[0].is_admin || false);
      }

      // Fetch teams the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userData.user.id);

      if (memberError) throw memberError;
      
      // Get unique team IDs
      const teamIds = memberData?.map(member => member.team_id) || [];
      
      // If user is a member of teams, fetch those teams
      if (teamIds.length > 0) {
        const { data: teamData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds);

        if (teamsError) throw teamsError;
        setTeams(teamData || []);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teams',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createTeam = async (companyName: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Insert the new team
      const { data, error } = await supabase
        .from('teams')
        .insert({
          company_name: companyName,
          created_by: userData.user.id,
          subscription_plan: 'free',
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: userData.user.id,
          team_id: data.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      // Log the action in audit_logs
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'create_team',
          entity_type: 'teams',
          entity_id: data.id,
          details: { team_name: companyName }
        });

      await fetchTeams();
      toast({
        title: 'Success',
        description: 'Team created successfully',
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive',
      });
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

  // Used to check if user has admin rights for a team
  const checkTeamAdminRights = async (teamId: string, userId: string) => {
    try {
      // Using a different approach to avoid deep type instantiation issues
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId);
      
      if (error || !data || data.length === 0) return false;
      
      // User either needs to be a team admin or system admin
      return data[0]?.role === 'admin' || isAdmin;
    } catch {
      return false;
    }
  };

  const addTeamMember = async ({ teamId, email, role }: AddMemberParams) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Check admin rights
      const hasAdminRights = await checkTeamAdminRights(teamId, userData.user.id);
      if (!hasAdminRights) {
        throw new Error('You need admin privileges to add team members');
      }

      // Use a plain SQL query to avoid TypeScript type instantiation issues
      const { data, error } = await supabase
        .from('user_settings')
        .select('user_id')
        .eq('email', email);

      if (error) throw error;
      
      // Explicitly type the result to avoid excessive type instantiation
      const userByEmail = data as { user_id: string }[] | null;
      
      if (!userByEmail || userByEmail.length === 0) {
        // TODO: Send invitation email if user doesn't exist
        toast({
          title: 'User not found',
          description: 'User with this email is not registered in the system',
          variant: 'destructive',
        });
        return false;
      }

      // Add user to team
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          user_id: userByEmail[0].user_id,
          team_id: teamId,
          role: role,
        });

      if (insertError) throw insertError;

      // Log the action
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

      // Check admin rights
      const hasAdminRights = await checkTeamAdminRights(teamId, userData.user.id);
      if (!hasAdminRights) {
        throw new Error('You need admin privileges to remove team members');
      }

      // Get the member details before removing
      const { data: memberData, error: getMemberError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('id', memberId);

      if (getMemberError) throw getMemberError;
      if (!memberData || memberData.length === 0) throw new Error('Team member not found');

      // Delete team member
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;

      // Log the action
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

  const upgradeSubscription = async (teamId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // In a real implementation, this would redirect to Stripe payment
      // For now, we'll simulate a successful payment

      // Update team subscription
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          subscription_plan: 'premium',
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId);

      if (updateError) throw updateError;

      // Create a payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userData.user.id,
          amount: 5,
          status: 'success',
          payment_method: 'credit_card',
        });

      if (paymentError) throw paymentError;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'upgrade_subscription',
          entity_type: 'teams',
          entity_id: teamId,
          details: { plan: 'premium', amount: 5 }
        });

      await fetchTeams();
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to upgrade subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  const cancelSubscription = async (teamId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Update team subscription
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          subscription_plan: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId);

      if (updateError) throw updateError;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'cancel_subscription',
          entity_type: 'teams',
          entity_id: teamId,
          details: { previous_plan: 'premium' }
        });

      await fetchTeams();
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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
