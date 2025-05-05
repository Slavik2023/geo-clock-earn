
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

  const hasDetailedInfo = locationDetails.street || locationDetails.city || locationDetails.state || locationDetails.zip_code;

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
        
        {hasDetailedInfo && (
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600 border-t pt-2">
            {locationDetails.street && (
              <>
                <span className="font-medium">Street:</span>
                <span>{locationDetails.street}</span>
              </>
            )}
            
            {locationDetails.city && (
              <>
                <span className="font-medium">City:</span>
                <span>{locationDetails.city}</span>
              </>
            )}
            
            {locationDetails.state && (
              <>
                <span className="font-medium">State/Region:</span>
                <span>{locationDetails.state}</span>
              </>
            )}
            
            {locationDetails.zip_code && (
              <>
                <span className="font-medium">ZIP/Postal Code:</span>
                <span>{locationDetails.zip_code}</span>
              </>
            )}
          </div>
        )}
        
        <div className="flex flex-col gap-1 mt-2 pt-2 border-t">
          <p className="text-sm">Regular rate: ${locationDetails.hourly_rate.toFixed(2)}/hr</p>
          <p className="text-sm">Overtime rate: ${overtimeRate.toFixed(2)}/hr (after {overtimeThreshold}h)</p>
        </div>
      </CardContent>
    </Card>
  );
}
