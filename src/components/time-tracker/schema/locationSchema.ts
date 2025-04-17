
import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().min(1, "Address is required"),
  hourly_rate: z.coerce.number().min(0.01, "Hourly rate must be greater than 0"),
  overtime_rate: z.coerce.number().min(0.01, "Overtime rate must be greater than 0").optional(),
  zip_code: z.string().optional(),
  radius: z.coerce.number().min(10, "Radius must be at least 10 meters").default(100),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

export interface Location extends LocationFormValues {
  id?: string;
  user_id?: string;
  created_at?: string;
}
