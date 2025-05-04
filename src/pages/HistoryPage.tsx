
import { useState, useEffect } from "react";
import { fetchSessions, fetchSessionsByDateRange } from "@/components/time-tracker/services/sessionService";
import { WorkSessionCard, WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, BarChart2, ClipboardListIcon } from "lucide-react";
import { AnalyticsCard } from "@/components/time-tracker/AnalyticsCard";
import { DateRange } from "react-day-picker";

export function HistoryPage() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sessions");
  
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
      try {
        // Check if both from and to dates are set before fetching
        if (dateRange.from && dateRange.to) {
          const from = startOfDay(dateRange.from);
          const to = endOfDay(dateRange.to);
          const data = await fetchSessionsByDateRange(from, to);
          setSessions(data);
        } else if (dateRange.from) {
          // If only from date is set, use it for both start and end
          const from = startOfDay(dateRange.from);
          const to = endOfDay(dateRange.from);
          const data = await fetchSessionsByDateRange(from, to);
          setSessions(data);
        }
      } catch (err) {
        setError("Failed to load sessions");
        console.error("Error loading sessions:", err);
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
            <div className="text-center py-8 text-red-500">{error}</div>
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
          <AnalyticsCard sessions={sessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
