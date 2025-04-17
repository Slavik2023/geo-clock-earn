
import * as z from "zod";

// Define the location schema
export const locationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  hourly_rate: z.coerce.number().min(1, "Hourly rate must be at least 1"),
  overtime_rate: z.coerce.number().min(1, "Overtime rate must be at least 1").optional(),
  zip_code: z.string().optional(),
  radius: z.coerce.number().min(10, "Radius must be at least 10 meters").default(100),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

export interface Location {
  id: string;
  name: string;
  address: string;
  hourly_rate: number;
  overtime_rate?: number;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
}
