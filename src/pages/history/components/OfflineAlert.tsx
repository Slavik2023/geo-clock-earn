
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OfflineAlertProps {
  offlineSessionsUsed: boolean;
}

export function OfflineAlert({ offlineSessionsUsed }: OfflineAlertProps) {
  const { user } = useAuth();
  
  if (!offlineSessionsUsed) {
    return null;
  }
  
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-300 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
        <AlertDescription className="text-amber-800 mt-0">
          {user 
            ? "Using locally stored sessions. Some data may not be up to date."
            : "You are viewing local sessions only. Sign in to sync your sessions and view server data."
          }
        </AlertDescription>
        
        {!user && (
          <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 bg-white border-amber-300 text-amber-800 hover:bg-amber-100">
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
      </div>
    </Alert>
  );
}
