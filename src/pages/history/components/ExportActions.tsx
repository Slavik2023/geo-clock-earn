
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { ExportButton } from "@/components/time-tracker/exports/ExportButton";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

interface ExportActionsProps {
  sessions: WorkSession[];
  isLoading: boolean;
}

export function ExportActions({ sessions, isLoading }: ExportActionsProps) {
  const hasData = sessions.length > 0 && !isLoading;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex gap-2 items-center"
          disabled={!hasData}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <ExportButton 
            sessions={sessions}
            isLoading={isLoading}
            exportType="excel"
            className="w-full justify-start cursor-pointer"
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <ExportButton 
            sessions={sessions}
            isLoading={isLoading}
            exportType="pdf"
            className="w-full justify-start cursor-pointer"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
