
import { supabase } from '@/integrations/supabase/client';
import { TeamMemberResult, UserSettingAdminResult } from './types';

export function useTeamMemberPermissions() {
  const checkTeamAdminRights = async (teamId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .returns<TeamMemberResult[]>();
      
      if (error || !data || data.length === 0) return false;
      
      const settingsQuery = await supabase
        .from('user_settings')
        .select('is_admin')
        .eq('user_id', userId)
        .single();
      
      if (settingsQuery.error) return false;
      
      // Using type assertion after fetching the data to avoid TS depth issue
      const userSettings = settingsQuery.data as UserSettingAdminResult | null;
      
      return data[0]?.role === 'admin' || userSettings?.is_admin;
    } catch {
      return false;
    }
  };

  return { checkTeamAdminRights };
}
