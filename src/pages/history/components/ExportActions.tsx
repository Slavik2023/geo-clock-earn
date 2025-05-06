
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { ExportButton } from "@/components/time-tracker/exports/ExportButton";

interface ExportActionsProps {
  sessions: WorkSession[];
  isLoading: boolean;
}

export function ExportActions({ sessions, isLoading }: ExportActionsProps) {
  return (
    <div className="flex space-x-2 ml-auto">
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
  );
}
