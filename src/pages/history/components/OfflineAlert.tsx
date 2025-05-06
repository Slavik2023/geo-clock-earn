
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface OfflineAlertProps {
  offlineSessionsUsed: boolean;
}

export function OfflineAlert({ offlineSessionsUsed }: OfflineAlertProps) {
  if (!offlineSessionsUsed) {
    return null;
  }
  
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-300">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        Using locally stored sessions. Some data may not be up to date.
      </AlertDescription>
    </Alert>
  );
}
