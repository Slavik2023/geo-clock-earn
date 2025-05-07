
import { supabase } from "@/integrations/supabase/client";

// Synchronize offline sessions to the server when a user logs in
export async function syncOfflineSessionsToServer(userId: string): Promise<boolean> {
  try {
    const offlineSessions = JSON.parse(localStorage.getItem('offlineSessions') || '[]');
    
    if (!offlineSessions.length) {
      console.log("No offline sessions to synchronize");
      return true;
    }
    
    console.log(`Attempting to sync ${offlineSessions.length} offline sessions to server`);
    
    const sessionsToSync = offlineSessions.map((session: any) => ({
      user_id: userId,
      start_time: session.startTime,
      end_time: session.endTime,
      hourly_rate: session.hourlyRate || 0,
      earnings: session.earnings || 0,
      address: session.address || "Offline location",
      is_manual_entry: true
    }));
    
    const { data, error } = await supabase
      .from("sessions")
      .insert(sessionsToSync)
      .select();
    
    if (error) {
      console.error("Error syncing offline sessions:", error);
      return false;
    }
    
    console.log("Successfully synced offline sessions:", data);
    localStorage.removeItem('offlineSessions');
    return true;
  } catch (error) {
    console.error("Error in syncOfflineSessionsToServer:", error);
    return false;
  }
}
