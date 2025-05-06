
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, ClipboardListIcon } from "lucide-react";
import { SessionsList } from "./SessionsList";
import { AnalyticsCard } from "@/components/time-tracker/AnalyticsCard";

interface HistoryTabsProps {
  sessions: WorkSession[];
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function HistoryTabs({
  sessions,
  isLoading,
  error,
  activeTab,
  setActiveTab
}: HistoryTabsProps) {
  return (
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
        <SessionsList 
          sessions={sessions} 
          isLoading={isLoading} 
          error={error}
        />
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
  );
}
