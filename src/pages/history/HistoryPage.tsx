
import { useState, useEffect } from "react";
import { fetchSessionsByDateRange, getOfflineSessions } from "@/components/time-tracker/services/sessionService";
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { useLocation } from "react-router-dom";
import { DateRange } from "react-day-picker";

// Import our newly created components
import { DateRangeSelector } from "./components/DateRangeSelector";
import { OfflineAlert } from "./components/OfflineAlert";
import { HistoryTabs } from "./components/HistoryTabs";
import { ExportActions } from "./components/ExportActions";

export function HistoryPage() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineSessionsUsed, setOfflineSessionsUsed] = useState(false);
  const location = useLocation();
  
  // Check if we should show analytics tab based on URL parameter
  const urlParams = new URLSearchParams(location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'analytics' ? "analytics" : "sessions");
  
  // Date filtering state using DateRange type
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch sessions on initial load and when date range changes
  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      setError(null);
      setOfflineSessionsUsed(false);

      try {
        let data: WorkSession[] = [];
        
        // Check if both from and to dates are set before fetching
        if (dateRange.from && dateRange.to) {
          const from = startOfDay(dateRange.from);
          const to = endOfDay(dateRange.to);
          data = await fetchSessionsByDateRange(from, to);
        } else if (dateRange.from) {
          // If only from date is set, use it for both start and end
          const from = startOfDay(dateRange.from);
          const to = endOfDay(dateRange.from);
          data = await fetchSessionsByDateRange(from, to);
        }
        
        if (data.length === 0) {
          // No sessions from server, try to get offline sessions
          const offlineSessions = getOfflineSessions();
          if (offlineSessions.length > 0) {
            data = offlineSessions;
            setOfflineSessionsUsed(true);
          }
        }
        
        setSessions(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load sessions");
        console.error("Error loading sessions:", err);
        
        // Try to load offline sessions as fallback
        const offlineSessions = getOfflineSessions();
        if (offlineSessions.length > 0) {
          setSessions(offlineSessions);
          setOfflineSessionsUsed(true);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSessions();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />
      
      <OfflineAlert offlineSessionsUsed={offlineSessionsUsed} />
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {/* Quick filter buttons are now inside DateRangeSelector */}
        <div className="flex-1"></div>
        <ExportActions sessions={sessions} isLoading={isLoading} />
      </div>
      
      <HistoryTabs
        sessions={sessions}
        isLoading={isLoading}
        error={error}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
