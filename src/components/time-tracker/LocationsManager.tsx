
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LocationForm } from "./LocationForm";
import { LocationCard } from "./LocationCard";
import { Location, LocationFormValues } from "./schema/locationSchema";
import { fetchLocations, insertLocation, updateLocation, deleteLocation } from "./services/locationService";

export function LocationsManager() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Fetch user's saved locations
  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast({
          variant: "destructive",
          title: "Error fetching locations",
          description: "Please try again later.",
        });
      }
    }

    loadLocations();
  }, [toast]);

  const handleAddLocation = async (data: LocationFormValues) => {
    setIsLoading(true);
    try {
      // In a real app, you would use a geocoding API here
      let latitude = null;
      let longitude = null;
      
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      if (editingLocation) {
        // Update existing location
        const locationData = {
          ...data,
          latitude,
          longitude,
        };
        
        await updateLocation(editingLocation.id, locationData);
      } else {
        // Insert new location
        await insertLocation({
          name: data.name,
          address: data.address,
          hourly_rate: data.hourly_rate,
          overtime_rate: data.overtime_rate,
          zip_code: data.zip_code || null,
          radius: data.radius || 100,
          latitude,
          longitude,
          user_id: userId,
        });
      }
      
      toast({
        title: editingLocation ? "Location updated" : "Location added",
        description: `${data.name} has been ${editingLocation ? "updated" : "added"} successfully.`,
      });
      
      // Refresh the location list
      const refreshedLocations = await fetchLocations();
      setLocations(refreshedLocations);
      setOpen(false);
      setEditingLocation(null);
    } catch (error) {
      console.error("Error saving location:", error);
      toast({
        variant: "destructive",
        title: "Error saving location",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setOpen(true);
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    
    try {
      await deleteLocation(id);
      
      toast({
        title: "Location deleted",
        description: "The location has been removed.",
      });
      
      // Update the locations list
      setLocations(locations.filter(loc => loc.id !== id));
    } catch (error) {
      console.error("Error deleting location:", error);
      toast({
        variant: "destructive",
        title: "Error deleting location",
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Saved Locations</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLocation(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Edit Location" : "Add New Location"}
              </DialogTitle>
            </DialogHeader>
            <LocationForm 
              onSubmit={handleAddLocation}
              editingLocation={editingLocation}
              isLoading={isLoading}
              open={open}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {locations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No saved locations yet.</p>
          <p className="text-sm">Add a location to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((location) => (
            <LocationCard 
              key={location.id}
              location={location}
              onEdit={handleEditLocation}
              onDelete={handleDeleteLocation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
