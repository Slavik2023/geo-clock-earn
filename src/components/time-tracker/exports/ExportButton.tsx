
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToExcel } from "./exportToExcel";
import { exportToPdf } from "./exportToPdf";
import { WorkSession } from "../WorkSessionCard";

interface ExportButtonProps {
  sessions: WorkSession[];
  isLoading?: boolean;
  exportType: "pdf" | "excel";
  className?: string;
}

export function ExportButton({ 
  sessions, 
  isLoading = false, 
  exportType, 
  className 
}: ExportButtonProps) {
  const handleExport = () => {
    if (sessions.length === 0) return;
    
    if (exportType === "excel") {
      exportToExcel(sessions);
    } else {
      exportToPdf(sessions);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleExport}
      disabled={isLoading || sessions.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Export {exportType.toUpperCase()}
    </Button>
  );
}
