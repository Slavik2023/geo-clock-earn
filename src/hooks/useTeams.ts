import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  company_name: string;
  subscription_plan: string;
  created_at: string;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Get user settings to determine admin status
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('is_admin')
        .eq('user_id', userData.user.id)
        .single();

      if (!settingsError) {
        setIsAdmin(userSettings?.is_admin || false);
      }

      // Use the security definer function to avoid recursion in RLS policies
      const { data, error } = await supabase.rpc(
        'get_user_teams',
        { user_id_param: userData.user.id }
      );

      if (error) throw error;
      setTeams(data || []);
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
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // First create the team - Using correct typing for Supabase RPC
      const { data, error } = await supabase.rpc(
        'create_team_with_member',
        { 
          company_name_param: companyName,
          user_id_param: userData.user.id
        }
      );

      if (error) throw error;

      // Add audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'create_team',
          entity_type: 'teams',
          entity_id: data[0].id,
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    isLoading,
    isAdmin,
    createTeam,
    fetchTeams
  };
}
