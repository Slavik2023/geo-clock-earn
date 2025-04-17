
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { LocationDetails } from "@/components/time-tracker/EnhancedLocationCheck";

interface CurrentLocationCardProps {
  locationDetails: LocationDetails | null;
  overtimeRate: number;
  overtimeThreshold: number;
}

export function CurrentLocationCard({ locationDetails, overtimeRate, overtimeThreshold }: CurrentLocationCardProps) {
  if (!locationDetails) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Current Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">{locationDetails?.name || "Working"}</p>
        <p className="text-sm text-muted-foreground">{locationDetails?.address}</p>
        <div className="flex flex-col gap-1 mt-2">
          <p className="text-sm">Regular rate: ${locationDetails?.hourly_rate.toFixed(2)}/hr</p>
          <p className="text-sm">Overtime rate: ${overtimeRate.toFixed(2)}/hr (after {overtimeThreshold}h)</p>
        </div>
      </CardContent>
    </Card>
  );
}
