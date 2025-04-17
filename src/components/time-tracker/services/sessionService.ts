
import { supabase } from "@/integrations/supabase/client";
import { WorkSession } from "../WorkSessionCard";

export async function fetchSessions(): Promise<WorkSession[]> {
  console.log("Fetching all sessions");
  const { data, error } = await supabase
    .from("sessions")
    .select("*, locations(name)")
    .order("start_time", { ascending: false });
  
  if (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
  
  console.log("Fetched sessions data:", data);
  
  // Transform database records to WorkSession format
  return (data || []).map(session => ({
    id: session.id,
    startTime: new Date(session.start_time),
    endTime: session.end_time ? new Date(session.end_time) : undefined,
    location: session.locations?.name || session.address || "Unknown location",
    earnings: session.earnings || 0,
  }));
}

export async function fetchSessionsByDateRange(startDate: Date, endDate: Date): Promise<WorkSession[]> {
  console.log(`Fetching sessions from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  const { data, error } = await supabase
    .from("sessions")
    .select("*, locations(name)")
    .gte("start_time", startDate.toISOString())
    .lte("start_time", endDate.toISOString())
    .order("start_time", { ascending: false });
  
  if (error) {
    console.error("Error fetching sessions by date range:", error);
    throw error;
  }
  
  console.log("Fetched date range sessions data:", data);
  
  return (data || []).map(session => ({
    id: session.id,
    startTime: new Date(session.start_time),
    endTime: session.end_time ? new Date(session.end_time) : undefined,
    location: session.locations?.name || session.address || "Unknown location",
    earnings: session.earnings || 0,
  }));
}
