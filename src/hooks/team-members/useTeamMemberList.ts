
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TeamMember } from './types';

export function useTeamMemberList() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTeamMembers = useCallback(async (teamId: string) => {
    setIsLoading(true);
    try {
      // Use a direct query without complex joins to avoid recursion in RLS policies
      const { data, error } = await supabase.rpc(
        'get_team_members_by_team',
        { team_id_param: teamId }
      );

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    teamMembers,
    fetchTeamMembers,
    isLoading
  };
}
