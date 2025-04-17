
import { useState, useEffect } from "react";
import { Clock } from "@/components/time-tracker/Clock";
import { TimerButton } from "@/components/time-tracker/TimerButton";
import { EnhancedLocationCheck, LocationDetails } from "@/components/time-tracker/EnhancedLocationCheck";
import { EarningsCard } from "@/components/time-tracker/EarningsCard";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function TrackerPage() {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [overtimeRate, setOvertimeRate] = useState(37.5);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an active timer in localStorage
    const activeTimerStart = localStorage.getItem("activeTimerStart");
    const activeSessionId = localStorage.getItem("activeSessionId");
    const activeLocationDetails = localStorage.getItem("activeLocationDetails");
    
    if (activeTimerStart) {
      setStartTime(new Date(activeTimerStart));
      setIsTracking(true);
      setCurrentSessionId(activeSessionId);
      
      if (activeLocationDetails) {
        const parsedLocationDetails = JSON.parse(activeLocationDetails);
        setLocationDetails(parsedLocationDetails);
        setHourlyRate(parsedLocationDetails.hourly_rate || 25);
      }
    }
  }, []);

  const handleLocationVerified = (verified: boolean, details?: LocationDetails) => {
    setIsLocationVerified(verified);
    
    if (verified && details) {
      setLocationDetails(details);
      setHourlyRate(details.hourly_rate || 25);
    } else if (!verified) {
      toast({
        variant: "destructive",
        title: "Location Not Verified",
        description: "Please enable location services to use time tracking."
      });
    }
  };

  const handleToggleTimer = async () => {
    if (!isLocationVerified && !isTracking) {
      toast({
        variant: "destructive",
        title: "Location Required",
        description: "Your location must be verified before tracking time."
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!isTracking) {
        // Start tracking
        const now = new Date();
        setStartTime(now);
        setIsTracking(true);
        
        // Save to localStorage
        localStorage.setItem("activeTimerStart", now.toISOString());
        localStorage.setItem("activeLocationDetails", JSON.stringify(locationDetails));
        
        // Create a new session in the database
        if (locationDetails) {
          const user = (await supabase.auth.getUser()).data.user;
          
          if (user) {
            const sessionData = {
              user_id: user.id,
              location_id: locationDetails.id,
              start_time: now.toISOString(),
              hourly_rate: locationDetails.hourly_rate,
              address: locationDetails.address,
              latitude: locationDetails.latitude,
              longitude: locationDetails.longitude,
              is_manual_entry: !locationDetails.id // If no location ID, it's a manual entry
            };
            
            const { data, error } = await supabase
              .from("sessions")
              .insert(sessionData)
              .select();
            
            if (error) {
              console.error("Error creating session:", error);
            } else if (data && data[0]) {
              setCurrentSessionId(data[0].id);
              localStorage.setItem("activeSessionId", data[0].id);
            }
          }
        }
        
        toast({
          title: "Time Tracking Started",
          description: `Started at ${now.toLocaleTimeString()} at ${locationDetails?.name || locationDetails?.address || 'current location'}`,
        });
      } else {
        // Stop tracking
        const now = new Date();
        setEndTime(now);
        setIsTracking(false);
        
        // Calculate duration and earnings
        if (startTime) {
          const durationMs = now.getTime() - startTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          const earnings = durationHours * hourlyRate;
          
          // Update the session in the database
          if (currentSessionId) {
            const { error } = await supabase
              .from("sessions")
              .update({
                end_time: now.toISOString(),
                earnings: earnings
              })
              .eq("id", currentSessionId);
            
            if (error) {
              console.error("Error updating session:", error);
            }
          }
          
          toast({
            title: "Time Tracking Stopped",
            description: `You earned $${earnings.toFixed(2)} for this session.`,
          });
          
          // Clear the active timer
          localStorage.removeItem("activeTimerStart");
          localStorage.removeItem("activeSessionId");
          localStorage.removeItem("activeLocationDetails");
          
          // After a short delay, reset the start time
          setTimeout(() => {
            setStartTime(null);
            setCurrentSessionId(null);
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Time tracking error:", error);
      toast({
        variant: "destructive",
        title: `Error ${isTracking ? "Stopping" : "Starting"} Timer`,
        description: "There was an error with the time tracking operation."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Clock />
      
      <div className="w-full max-w-md">
        {isTracking ? (
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
              <p className="text-sm mt-1">Hourly rate: ${locationDetails?.hourly_rate.toFixed(2)}/hr</p>
            </CardContent>
          </Card>
        ) : (
          <EnhancedLocationCheck onLocationVerified={handleLocationVerified} />
        )}
      </div>
      
      <TimerButton 
        isActive={isTracking} 
        onToggle={handleToggleTimer} 
        isLoading={isLoading}
        disabled={!isLocationVerified && !isTracking}
      />
      
      <div className="w-full max-w-md mt-4">
        <EarningsCard 
          hourlyRate={hourlyRate}
          overtimeRate={overtimeRate}
          startTime={startTime}
          isActive={isTracking}
        />
      </div>
    </div>
  );
}
