
/**
 * OpenStreetMapUtils.ts
 * Utility functions for interacting with OpenStreetMap's Nominatim API
 */

export interface AddressDetails {
  address: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
}

/**
 * Fetches address details from coordinates using OpenStreetMap's Nominatim API
 */
export const fetchAddressFromCoordinates = async (lat: number, lng: number): Promise<AddressDetails> => {
  try {
    console.log("Requesting geocoding for:", lat, lng);
    
    // Using detailed parameters to get more accurate information
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TimeTracker App' // Required by OSM Nominatim usage policy
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log("Response from Nominatim:", data);
    
    // Extract detailed address information
    const address = data.display_name || '';
    const street = data.address?.road || data.address?.street || '';
    const houseNumber = data.address?.house_number || '';
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.hamlet || '';
    const state = data.address?.state || data.address?.county || '';
    const zipCode = data.address?.postcode || '';
    
    // Create full street address
    const streetAddress = houseNumber ? `${houseNumber} ${street}` : street;
    
    return {
      address,
      street: streetAddress,
      city,
      state,
      zipCode,
      latitude: lat,
      longitude: lng
    };
  } catch (error) {
    console.error("Error getting address:", error);
    return {
      address: `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
      latitude: lat,
      longitude: lng
    };
  }
};
