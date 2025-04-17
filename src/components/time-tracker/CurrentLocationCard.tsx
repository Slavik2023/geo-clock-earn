
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";
import { LocationDetails } from "@/components/time-tracker/EnhancedLocationCheck";

interface CurrentLocationCardProps {
  locationDetails: LocationDetails | null;
  overtimeRate: number;
  overtimeThreshold: number;
}

export function CurrentLocationCard({ locationDetails, overtimeRate, overtimeThreshold }: CurrentLocationCardProps) {
  if (!locationDetails) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center text-yellow-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            Location Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            Unable to determine your current location. Please verify your location settings and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Current Location
        </CardTitle>
        {!locationDetails.name && !locationDetails.address && (
          <CardDescription className="text-yellow-600">
            Limited location information available
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="font-medium">{locationDetails.name || "Working Location"}</p>
        <p className="text-sm text-muted-foreground">{locationDetails.address || "Address not available"}</p>
        <div className="flex flex-col gap-1 mt-2">
          <p className="text-sm">Regular rate: ${locationDetails.hourly_rate.toFixed(2)}/hr</p>
          <p className="text-sm">Overtime rate: ${overtimeRate.toFixed(2)}/hr (after {overtimeThreshold}h)</p>
        </div>
      </CardContent>
    </Card>
  );
}
