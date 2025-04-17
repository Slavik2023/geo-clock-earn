
import { useEffect } from "react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationSchema, LocationFormValues, Location } from "./schema/locationSchema";

interface LocationFormProps {
  onSubmit: (data: LocationFormValues) => void;
  editingLocation: Location | null;
  isLoading: boolean;
  open: boolean;
  initialAddress?: string;
  initialCoordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

export function LocationForm({ 
  onSubmit, 
  editingLocation, 
  isLoading, 
  open, 
  initialAddress, 
  initialCoordinates 
}: LocationFormProps) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: initialAddress || "",
      hourly_rate: 25,
      overtime_rate: 37.5,
      zip_code: "",
      radius: 100,
      latitude: initialCoordinates?.latitude || null,
      longitude: initialCoordinates?.longitude || null,
    },
  });

  // Reset form when dialog opens/closes or editing location changes
  useEffect(() => {
    if (open) {
      if (editingLocation) {
        form.reset({
          name: editingLocation.name,
          address: editingLocation.address,
          hourly_rate: editingLocation.hourly_rate,
          overtime_rate: editingLocation.overtime_rate,
          zip_code: editingLocation.zip_code || "",
          radius: editingLocation.radius || 100,
          latitude: editingLocation.latitude || null,
          longitude: editingLocation.longitude || null,
        });
      } else {
        form.reset({
          name: "",
          address: initialAddress || "",
          hourly_rate: 25,
          overtime_rate: 37.5,
          zip_code: "",
          radius: 100,
          latitude: initialCoordinates?.latitude || null,
          longitude: initialCoordinates?.longitude || null,
        });
      }
    }
  }, [open, editingLocation, form, initialAddress, initialCoordinates]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="overtime_rate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Overtime Rate ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex gap-4">
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
          
          <FormField
            control={form.control}
            name="radius"
            render={({ field }) => (
              <FormItem className="flex-1">
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
        </div>
        
        {initialCoordinates && (
          <div className="p-3 bg-blue-50 rounded-md text-xs">
            Location coordinates have been automatically detected from the map.
          </div>
        )}
        
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
  );
}
