
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/App";

interface OfflineAlertProps {
  offlineSessionsUsed: boolean;
}

export function OfflineAlert({ offlineSessionsUsed }: OfflineAlertProps) {
  const { user } = useAuth();
  
  if (!offlineSessionsUsed) {
    return null;
  }
  
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-300 mb-4">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        {user 
          ? "Using locally stored sessions. Some data may not be up to date."
          : "You are viewing local sessions only. Sign in to sync your sessions and view server data."
        }
      </AlertDescription>
    </Alert>
  );
}
