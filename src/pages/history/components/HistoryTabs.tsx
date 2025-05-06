
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, ClipboardListIcon } from "lucide-react";
import { SessionsList } from "./SessionsList";
import { AnalyticsCard } from "@/components/time-tracker/AnalyticsCard";

interface HistoryTabsProps {
  activeTab: "all" | "range";
  onTabChange: (tab: "all" | "range") => void;
  sessions?: WorkSession[];
  isLoading?: boolean;
  error?: string | null;
}

export function HistoryTabs({
  activeTab,
  onTabChange,
  sessions = [],
  isLoading = false,
  error = null
}: HistoryTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="all" className="flex items-center gap-2">
          <ClipboardListIcon className="h-4 w-4" />
          All Sessions
        </TabsTrigger>
        <TabsTrigger value="range" className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Date Range
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        {sessions && sessions.length > 0 ? (
          <SessionsList 
            sessions={sessions} 
            isLoading={isLoading} 
            error={error}
          />
        ) : null}
      </TabsContent>
      
      <TabsContent value="range" className="space-y-4">
        {sessions && sessions.length > 0 ? (
          <SessionsList 
            sessions={sessions} 
            isLoading={isLoading} 
            error={error}
          />
        ) : null}
      </TabsContent>
    </Tabs>
  );
}
