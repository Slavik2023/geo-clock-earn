
import { useState, useEffect } from "react";
import { fetchSessions, fetchSessionsByDateRange, getOfflineSessions } from "@/components/time-tracker/services/sessionService";
import { WorkSessionCard, WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, BarChart2, ClipboardListIcon, AlertTriangle } from "lucide-react";
import { AnalyticsCard } from "@/components/time-tracker/AnalyticsCard";
import { DateRange } from "react-day-picker";
import { useLocation } from "react-router-dom";
import { ExportButton } from "@/components/time-tracker/exports/ExportButton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  const handleQuickFilter = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work History</h1>
        <div className="flex space-x-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {dateRange.from ? format(dateRange.from, "MMM d") : "Start date"} - 
                  {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "End date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={(newRange) => {
                  if (newRange) {
                    setDateRange(newRange);
                    setCalendarOpen(false);
                  }
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {offlineSessionsUsed && (
        <Alert variant="warning" className="bg-amber-50 border-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Using locally stored sessions. Some data may not be up to date.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleQuickFilter(7)}
        >
          Last 7 Days
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickFilter(30)}
        >
          Last 30 Days
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickFilter(90)}
        >
          Last 90 Days
        </Button>
        
        <div className="flex-1"></div>
        
        <ExportButton 
          sessions={sessions}
          isLoading={isLoading}
          exportType="excel"
          className="ml-auto"
        />
        
        <ExportButton 
          sessions={sessions}
          isLoading={isLoading}
          exportType="pdf"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <ClipboardListIcon className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading sessions...</div>
          ) : error ? (
            <Alert variant="destructive" className="bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sessions found for the selected date range.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <WorkSessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data available for analytics. Track some work sessions first.
            </div>
          ) : (
            <AnalyticsCard sessions={sessions} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
