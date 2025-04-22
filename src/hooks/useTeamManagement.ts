
import { useState, useEffect } from 'react';
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

export function useTeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const { data: teamData, error: teamsError } = await supabase
        .from('teams')
        .select('*');

      if (teamsError) throw teamsError;
      setTeams(teamData || []);
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
  };

  const createTeam = async (companyName: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .insert({
          company_name: companyName,
          created_by: userData.user.id,
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
  }, []);

  return {
    teams,
    isLoading,
    createTeam,
    fetchTeams,
  };
}
