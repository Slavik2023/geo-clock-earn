
import { supabase } from "@/integrations/supabase/client";
import { Location, LocationFormValues } from "../schema/locationSchema";

export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name");
  
  if (error) throw error;
  return data || [];
}

export async function insertLocation(locationData: {
  name: string;
  address: string;
  hourly_rate: number;
  overtime_rate?: number;
  zip_code?: string | null;
  radius?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  user_id: string;
}): Promise<Location> {
  const { data, error } = await supabase
    .from("locations")
    .insert(locationData)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateLocation(
  id: string, 
  locationData: Partial<Location>
): Promise<Location> {
  const { data, error } = await supabase
    .from("locations")
    .update(locationData)
    .eq("id", id)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase
    .from("locations")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}
