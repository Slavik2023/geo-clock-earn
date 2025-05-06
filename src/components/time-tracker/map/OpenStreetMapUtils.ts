
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
    console.log("Запрос геокодирования для:", lat, lng);
    
    // Используем подробные параметры для получения более точной информации
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TimeTracker App' // Требуется по политике использования OSM Nominatim
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log("Ответ от Nominatim:", data);
    
    // Извлекаем подробную информацию об адресе
    const address = data.display_name || '';
    const street = data.address?.road || data.address?.street || '';
    const houseNumber = data.address?.house_number || '';
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.hamlet || '';
    const state = data.address?.state || data.address?.county || '';
    const zipCode = data.address?.postcode || '';
    
    // Создаем полный адрес улицы
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
    console.error("Ошибка при получении адреса:", error);
    return {
      address: `Местоположение (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
      latitude: lat,
      longitude: lng
    };
  }
};
