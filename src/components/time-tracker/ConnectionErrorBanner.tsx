
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ConnectionErrorBannerProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ConnectionErrorBanner({ 
  message, 
  onRetry, 
  showRetry = true 
}: ConnectionErrorBannerProps) {
  return (
    <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800 mb-4">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-amber-700">
            {message}
          </AlertDescription>
          {showRetry && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-amber-700 border-amber-300 hover:bg-amber-100 hover:text-amber-800"
              onClick={onRetry}
            >
              Retry Connection
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
