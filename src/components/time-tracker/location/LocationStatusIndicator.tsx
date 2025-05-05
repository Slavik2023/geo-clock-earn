
import { CheckCircle, AlertCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type LocationStatus = "checking" | "verified" | "denied" | "error" | "selecting";

interface LocationStatusIndicatorProps {
  status: LocationStatus;
  message: string;
}

export function LocationStatusIndicator({ status, message }: LocationStatusIndicatorProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-3 rounded-md",
        status === "checking" && "bg-blue-50 text-blue-600",
        status === "verified" && "bg-green-50 text-green-600",
        status === "denied" && "bg-red-50 text-red-600",
        status === "error" && "bg-yellow-50 text-yellow-600",
        status === "selecting" && "bg-blue-50 text-blue-600",
      )}
    >
      {status === "checking" && (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
      )}
      {status === "verified" && <CheckCircle className="h-5 w-5" />}
      {status === "denied" && <AlertCircle className="h-5 w-5" />}
      {status === "error" && <AlertCircle className="h-5 w-5" />}
      {status === "selecting" && <MapPin className="h-5 w-5" />}
      
      <div className="flex-1">
        <span className="text-sm font-medium">
          {status === "checking" && "Checking Location"}
          {status === "verified" && "Location Verified"}
          {status === "denied" && "Location Access Denied"}
          {status === "error" && "Location Error"}
          {status === "selecting" && "Select Location"}
        </span>
        <span className="text-xs">{message}</span>
      </div>
    </div>
  );
}
