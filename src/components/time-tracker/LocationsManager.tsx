
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LocationForm } from "./LocationForm";
import { LocationsMap } from "./LocationsMap";
import { Location } from "./schema/locationSchema";
import { createLocation, deleteLocation, updateLocation } from "./services/locationService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LocationsManager() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapSelectedLocation, setMapSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data } = await supabase.from("locations").select("*");
      return data || [];
    }
  });

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id!, data);
      } else {
        const locationData = {
          ...data,
          latitude: mapSelectedLocation?.latitude || null,
          longitude: mapSelectedLocation?.longitude || null,
        };
        await createLocation(locationData);
      }
      
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsFormOpen(false);
      setEditingLocation(null);
      setMapSelectedLocation(null);
    } catch (error) {
      console.error("Error saving location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteLocation(id);
        queryClient.invalidateQueries({ queryKey: ["locations"] });
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsFormOpen(true);
  };

  const handleMapLocationSelected = (location: { address: string; latitude: number; longitude: number }) => {
    setMapSelectedLocation(location);
    setIsMapOpen(false);
    setIsFormOpen(true);
  };

  const openNewLocationForm = () => {
    setEditingLocation(null);
    setIsFormOpen(true);
  };

  const openLocationMap = () => {
    setIsMapOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Saved Locations</h2>
        <div className="flex gap-2">
          <Sheet open={isMapOpen} onOpenChange={setIsMapOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" onClick={openLocationMap} size="sm">
                Add with Map
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Select Location on Map</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <LocationsMap onSelectLocation={handleMapLocationSelected} />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button onClick={openNewLocationForm} size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Location
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>{editingLocation ? "Edit Location" : "Add New Location"}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <LocationForm
                  onSubmit={handleSubmit}
                  editingLocation={editingLocation}
                  isLoading={isLoading}
                  open={isFormOpen}
                  initialAddress={mapSelectedLocation?.address}
                  initialCoordinates={
                    mapSelectedLocation
                      ? {
                          latitude: mapSelectedLocation.latitude,
                          longitude: mapSelectedLocation.longitude,
                        }
                      : null
                  }
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {isLoadingLocations ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : locations.length === 0 ? (
        <div className="p-8 text-center border rounded-md">
          <h3 className="text-lg font-medium mb-2">No saved locations yet.</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add a location to get started.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={openLocationMap}>
              Add with Map
            </Button>
            <Button onClick={openNewLocationForm}>
              Add Manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {locations.map((location: Location) => (
            <div
              key={location.id}
              className="border rounded-md p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{location.name}</h3>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="text-xs">Rate: ${location.hourly_rate}/hr</span>
                    {location.overtime_rate && (
                      <span className="text-xs">OT: ${location.overtime_rate}/hr</span>
                    )}
                    {location.radius && (
                      <span className="text-xs">Radius: {location.radius}m</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(location.id!)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
