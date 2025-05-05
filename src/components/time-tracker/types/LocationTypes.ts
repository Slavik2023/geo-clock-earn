
export interface LocationDetails {
  id?: string;
  name?: string;
  address: string;
  hourly_rate: number;
  overtime_rate?: number;
  latitude?: number | null;
  longitude?: number | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
}

export interface EnhancedLocationCheckProps {
  onLocationVerified: (verified: boolean, locationDetails?: LocationDetails) => void;
}

export interface MapLocationSelection {
  address: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
}
