
import { supabase } from "@/integrations/supabase/client";
import { WorkSession } from "../WorkSessionCard";
import { toast } from "sonner";

export async function fetchSessions(): Promise<WorkSession[]> {
  console.log("Fetching all sessions");
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*, locations(name)")
      .order("start_time", { ascending: false });
    
    if (error) {
      console.error("Error fetching sessions:", error);
      
      // Check for recursion error - common with complex RLS policies
      if (error.message.includes("infinite recursion")) {
        console.log("Detected recursion error, trying simplified query");
        return fetchSessionsWithoutJoins();
      }
      
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
  } catch (error) {
    console.error("Error in fetchSessions:", error);
    toast.error("Could not load sessions from server. Using local data only.");
    return [];
  }
}

// Fallback function that doesn't join with locations table to avoid recursion issues
async function fetchSessionsWithoutJoins(): Promise<WorkSession[]> {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("start_time", { ascending: false });
      
    if (error) {
      console.error("Error in fallback session fetch:", error);
      return [];
    }
    
    return (data || []).map(session => ({
      id: session.id,
      startTime: new Date(session.start_time),
      endTime: session.end_time ? new Date(session.end_time) : undefined,
      location: session.address || "Unknown location",
      earnings: session.earnings || 0,
    }));
  } catch (error) {
    console.error("Fatal error in fallback session fetch:", error);
    return [];
  }
}

export async function fetchSessionsByDateRange(startDate: Date, endDate: Date): Promise<WorkSession[]> {
  console.log(`Fetching sessions from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*, locations(name)")
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString())
      .order("start_time", { ascending: false });
    
    if (error) {
      console.error("Error fetching sessions by date range:", error);
      
      // Check for recursion error - common with complex RLS policies
      if (error.message.includes("infinite recursion")) {
        console.log("Detected recursion error, trying simplified query for date range");
        return fetchSessionsByDateRangeWithoutJoins(startDate, endDate);
      }
      
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
  } catch (error) {
    console.error("Error in fetchSessionsByDateRange:", error);
    toast.error("Could not load sessions from server. Using local data only.");
    return [];
  }
}

// Fallback function that doesn't join with locations table to avoid recursion issues
async function fetchSessionsByDateRangeWithoutJoins(startDate: Date, endDate: Date): Promise<WorkSession[]> {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString())
      .order("start_time", { ascending: false });
      
    if (error) {
      console.error("Error in fallback date range session fetch:", error);
      return [];
    }
    
    return (data || []).map(session => ({
      id: session.id,
      startTime: new Date(session.start_time),
      endTime: session.end_time ? new Date(session.end_time) : undefined,
      location: session.address || "Unknown location",
      earnings: session.earnings || 0,
    }));
  } catch (error) {
    console.error("Fatal error in fallback date range session fetch:", error);
    return [];
  }
}

// New function to save session data to local storage as a backup
export function saveSessionToLocalStorage(session: {
  startTime: Date;
  endTime?: Date;
  earnings?: number;
  address?: string;
}) {
  try {
    const existingSessions = JSON.parse(localStorage.getItem('offlineSessions') || '[]');
    existingSessions.push({
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime ? session.endTime.toISOString() : null,
      id: `local-${Date.now()}`,
      earnings: session.earnings || 0
    });
    localStorage.setItem('offlineSessions', JSON.stringify(existingSessions));
    console.log("Session saved to local storage:", session);
  } catch (error) {
    console.error("Error saving session to local storage:", error);
  }
}

// Get offline sessions from local storage
export function getOfflineSessions(): WorkSession[] {
  try {
    const sessions = JSON.parse(localStorage.getItem('offlineSessions') || '[]');
    return sessions.map((session: any) => ({
      id: session.id,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      location: session.address || "Offline location",
      earnings: session.earnings || 0,
    }));
  } catch (error) {
    console.error("Error reading offline sessions:", error);
    return [];
  }
}
