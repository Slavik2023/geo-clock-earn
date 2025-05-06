
import { useEffect } from "react";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";
import { fetchAddressFromCoordinates } from "@/components/time-tracker/map/OpenStreetMapUtils";
import { toast } from "sonner";

export const useLocationTracking = (
  setLocationDetails: (details: LocationDetails) => void
) => {
  // Auto-detect location on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const addressDetails = await fetchAddressFromCoordinates(latitude, longitude);
            
            if (addressDetails) {
              setLocationDetails({
                address: addressDetails.address,
                latitude: latitude,
                longitude: longitude,
                hourly_rate: 25, // Default rate
                street: addressDetails.street || null,
                city: addressDetails.city || null,
                state: addressDetails.state || null,
                zip_code: addressDetails.zipCode || null
              });
            }
          } catch (error) {
            console.error("Error getting location details:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Unable to determine location. Please allow access to geolocation.");
        }
      );
    }
  }, [setLocationDetails]);

  const handleLocationVerified = (verified: boolean, details?: any) => {
    if (verified && details) {
      setLocationDetails(details);
    }
  };

  return {
    handleLocationVerified
  };
};
