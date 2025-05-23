
import { useState, useEffect } from "react";
import { DateRangeSelector } from "./components/DateRangeSelector";
import { SessionsList } from "./components/SessionsList";
import { ExportActions } from "./components/ExportActions";
import { OfflineAlert } from "./components/OfflineAlert";
import { HistoryTabs } from "./components/HistoryTabs";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { fetchSessionsByDateRange, fetchSessions, getOfflineSessions } from "@/components/time-tracker/services/sessionService";
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";

export function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "range">("all");
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineSessionsUsed, setOfflineSessionsUsed] = useState<boolean>(false);

  // Load sessions based on the active tab
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if user is authenticated
        if (user) {
          let sessionData: WorkSession[] = [];
          if (activeTab === "all") {
            sessionData = await fetchSessions();
          } else {
            sessionData = await fetchSessionsByDateRange(startDate, endDate);
          }
          
          if (sessionData.length === 0) {
            // If no sessions from server, try to get offline sessions
            const offlineSessions = getOfflineSessions();
            if (offlineSessions.length > 0) {
              sessionData = offlineSessions;
              setOfflineSessionsUsed(true);
            }
          } else {
            setOfflineSessionsUsed(false);
          }
          
          setSessions(sessionData);
        } else {
          // No logged in user, can only use offline sessions
          const offlineSessions = getOfflineSessions();
          setSessions(offlineSessions);
          setOfflineSessionsUsed(true);
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
        setError("Failed to load sessions. Please try again later.");
        
        // Fall back to offline sessions
        const offlineSessions = getOfflineSessions();
        if (offlineSessions.length > 0) {
          setSessions(offlineSessions);
          setOfflineSessionsUsed(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [user, activeTab, startDate, endDate]);

  const handleTabChange = (tab: "all" | "range") => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Work History</h1>
        <ExportActions sessions={sessions} isLoading={isLoading} />
      </div>
      
      <OfflineAlert offlineSessionsUsed={offlineSessionsUsed} />
      
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <HistoryTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          sessions={sessions}
          isLoading={isLoading}
          error={error}
        />
        
        {activeTab === "range" && (
          <div className="mt-4">
            <DateRangeSelector 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
        )}
        
        <div className="mt-6">
          <SessionsList 
            sessions={sessions}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
