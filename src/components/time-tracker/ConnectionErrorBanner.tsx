
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ConnectionErrorBannerProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: "warning" | "error" | "info";
}

export function ConnectionErrorBanner({ 
  message, 
  onRetry, 
  showRetry = true,
  variant = "warning"
}: ConnectionErrorBannerProps) {
  // Set appropriate styling based on the variant
  const getStyles = () => {
    switch (variant) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800 mb-4";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 mb-4";
      case "warning":
      default:
        return "bg-amber-50 border-amber-200 text-amber-800 mb-4";
    }
  };

  // Set icon color based on the variant
  const getIconColor = () => {
    switch (variant) {
      case "error":
        return "text-red-600";
      case "info":
        return "text-blue-600";
      case "warning":
      default:
        return "text-amber-600";
    }
  };

  // Set button styling based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case "error":
        return "text-red-700 border-red-300 hover:bg-red-100 hover:text-red-800";
      case "info":
        return "text-blue-700 border-blue-300 hover:bg-blue-100 hover:text-blue-800";
      case "warning":
      default:
        return "text-amber-700 border-amber-300 hover:bg-amber-100 hover:text-amber-800";
    }
  };

  return (
    <Alert variant="destructive" className={getStyles()}>
      <div className="flex items-start gap-2">
        {variant === "info" ? (
          <Info className={`h-5 w-5 ${getIconColor()} mt-0.5`} />
        ) : (
          <AlertCircle className={`h-5 w-5 ${getIconColor()} mt-0.5`} />
        )}
        <div className="flex-1">
          <AlertDescription className={variant === "error" ? "text-red-700" : variant === "info" ? "text-blue-700" : "text-amber-700"}>
            {message}
          </AlertDescription>
          {showRetry && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className={`mt-2 ${getButtonStyles()}`}
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
