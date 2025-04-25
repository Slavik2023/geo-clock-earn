
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
      
      const teamIds = memberData?.map(member => member.team_id) || [];
      
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

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: userData.user.id,
          team_id: data.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

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
