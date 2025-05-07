
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AuthErrorProps {
  message?: string;
  error?: string | null;
  onDismiss?: () => void;
}

export function AuthError({ message, error, onDismiss }: AuthErrorProps) {
  const errorMessage = message || error;
  
  if (!errorMessage) return null;
  
  return (
    <Alert variant="destructive" className="bg-red-100 border border-red-200">
      <div className="flex justify-between items-center">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5" />
          <div className="flex flex-col">
            <div className="font-medium">Authentication Error</div>
            <AlertDescription>{errorMessage}</AlertDescription>
          </div>
        </div>
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDismiss}
            className="text-red-500"
          >
            <X size={18} />
          </Button>
        )}
      </div>
    </Alert>
  );
}
