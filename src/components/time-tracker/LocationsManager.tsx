
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

// Define the location schema
const locationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  hourly_rate: z.coerce.number().min(1, "Hourly rate must be at least 1"),
  zip_code: z.string().optional(),
  radius: z.coerce.number().min(10, "Radius must be at least 10 meters").default(100),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface Location {
  id: string;
  name: string;
  address: string;
  hourly_rate: number;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
}

export function LocationsManager() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      hourly_rate: 25,
      zip_code: "",
      radius: 100,
    },
  });

  // Fetch user's saved locations
  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("*")
          .order("name");
        
        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast({
          variant: "destructive",
          title: "Error fetching locations",
          description: "Please try again later.",
        });
      }
    }

    fetchLocations();
  }, [toast]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (editingLocation) {
        form.reset({
          name: editingLocation.name,
          address: editingLocation.address,
          hourly_rate: editingLocation.hourly_rate,
          zip_code: editingLocation.zip_code || "",
          radius: editingLocation.radius || 100,
        });
      } else {
        form.reset({
          name: "",
          address: "",
          hourly_rate: 25,
          zip_code: "",
          radius: 100,
        });
      }
    }
  }, [open, editingLocation, form]);

  const handleAddLocation = async (data: LocationFormValues) => {
    setIsLoading(true);
    try {
      // Try to get the coordinates from the address
      let latitude = null;
      let longitude = null;
      
      // In a real app, you would use a geocoding API here
      // For demo purposes, we'll skip this step
      
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      let result;
      
      if (editingLocation) {
        // Update existing location
        const locationData = {
          ...data,
          latitude,
          longitude,
        };
        
        result = await supabase
          .from("locations")
          .update(locationData)
          .eq("id", editingLocation.id)
          .select();
      } else {
        // Insert new location - Fix: Ensure all required fields are present
        const locationData = {
          name: data.name,         // Required field from the form
          address: data.address,   // Required field from the form
          hourly_rate: data.hourly_rate, // Required field from the form
          zip_code: data.zip_code || null,
          radius: data.radius || 100,
          latitude,
          longitude,
          user_id: userId,
        };
        
        result = await supabase
          .from("locations")
          .insert(locationData)
          .select();
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: editingLocation ? "Location updated" : "Location added",
        description: `${data.name} has been ${editingLocation ? "updated" : "added"} successfully.`,
      });
      
      // Refresh the location list
      const { data: refreshedLocations } = await supabase
        .from("locations")
        .select("*")
        .order("name");
      
      setLocations(refreshedLocations || []);
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
      const { error } = await supabase
        .from("locations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddLocation)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Street Office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="hourly_rate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="radius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Radius (meters)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="10" 
                          step="10" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : (editingLocation ? "Update" : "Save")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
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
            <Card key={location.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {location.address}
                      {location.zip_code && `, ${location.zip_code}`}
                    </p>
                    <p className="text-sm font-medium">${location.hourly_rate}/hour</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditLocation(location)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
