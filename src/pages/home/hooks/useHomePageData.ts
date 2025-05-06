
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOfflineSessions } from "@/components/time-tracker/services/sessionService";
import { format } from "date-fns";

export function useHomePageData(userId: string | undefined) {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [connectionError, setConnectionError] = useState(false);

  const calculateOfflineEarnings = useCallback((sessions: any[]) => {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get week's date range (last 7 days)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    
    // Filter and calculate
    const todaySessions = sessions.filter(session => 
      new Date(session.startTime) >= today && 
      new Date(session.startTime) < tomorrow
    );
    
    const weekSessions = sessions.filter(session => 
      new Date(session.startTime) >= weekStart && 
      new Date(session.startTime) < tomorrow
    );
    
    // Calculate earnings
    const todaySum = todaySessions.reduce((sum, session) => 
      sum + (session.earnings || 0), 0);
    
    const weekSum = weekSessions.reduce((sum, session) => 
      sum + (session.earnings || 0), 0);
    
    // Set data if we don't already have earnings from the server
    if (todayEarnings === 0) {
      setTodayEarnings(todaySum);
    }
    
    if (weekEarnings === 0) {
      setWeekEarnings(weekSum);
      setSessionsCount(weekSessions.length);
    }
    
    // Calculate total hours
    const totalHoursWorked = sessions.reduce((total, session) => {
      if (session.startTime && session.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);
    
    if (totalHours === 0) {
      setTotalHours(totalHoursWorked);
    }
  }, [todayEarnings, weekEarnings, totalHours]);

  const fetchUserEarnings = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    let serverDataLoaded = false;
    
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get week's date range (last 7 days)
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 6);
      
      // Test database connection first to avoid multiple error logs
      const { error: pingError } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", userId)
        .limit(1);
        
      if (pingError) {
        console.error("Database connection test failed:", pingError);
        setConnectionError(true);
        
        // If connection fails, use offline data
        const offlineSessions = getOfflineSessions();
        if (offlineSessions.length > 0) {
          calculateOfflineEarnings(offlineSessions);
        }
        return;
      }
      
      // Fetch today's earnings
      const { data: todaySessions, error: todayError } = await supabase
        .from("sessions")
        .select("earnings")
        .eq("user_id", userId)
        .gte("start_time", today.toISOString())
        .lt("start_time", tomorrow.toISOString());
      
      if (todayError) {
        console.error("Error fetching today's earnings:", todayError);
      } else {
        const todaySum = todaySessions.reduce((sum, session) => 
          sum + (session.earnings || 0), 0);
        setTodayEarnings(todaySum);
        serverDataLoaded = true;
      }
      
      // Fetch week's earnings
      const { data: weekSessions, error: weekError } = await supabase
        .from("sessions")
        .select("earnings")
        .eq("user_id", userId)
        .gte("start_time", weekStart.toISOString())
        .lt("start_time", tomorrow.toISOString());
      
      if (weekError) {
        console.error("Error fetching week's earnings:", weekError);
      } else {
        const weekSum = weekSessions.reduce((sum, session) => 
          sum + (session.earnings || 0), 0);
        setWeekEarnings(weekSum);
        setSessionsCount(weekSessions.length);
        serverDataLoaded = true;
      }
      
      // Calculate total hours worked this month
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const { data: monthSessions, error: monthError } = await supabase
        .from("sessions")
        .select("start_time, end_time")
        .eq("user_id", userId)
        .gte("start_time", monthStart.toISOString())
        .lte("start_time", monthEnd.toISOString());
      
      if (monthError) {
        console.error("Error fetching month's sessions:", monthError);
      } else if (monthSessions) {
        let totalHoursWorked = 0;
        
        monthSessions.forEach(session => {
          if (session.start_time && session.end_time) {
            const start = new Date(session.start_time);
            const end = new Date(session.end_time);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            totalHoursWorked += hours;
          }
        });
        
        setTotalHours(totalHoursWorked);
        serverDataLoaded = true;
      }
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      setConnectionError(true);
    } finally {
      setIsLoading(false);
      
      // If we couldn't load server data, try to use offline data
      if (!serverDataLoaded) {
        const offlineSessions = getOfflineSessions();
        if (offlineSessions.length > 0) {
          calculateOfflineEarnings(offlineSessions);
        }
      }
    }
  }, [userId, calculateOfflineEarnings]);

  return {
    todayEarnings,
    weekEarnings,
    totalHours,
    sessionsCount,
    isLoading,
    connectionError,
    fetchUserEarnings
  };
}
