
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Locate } from "lucide-react";
import { toast } from "sonner";
import { fetchAddressFromCoordinates, AddressDetails } from "./OpenStreetMapUtils";

interface GeolocationHandlerProps {
  onLocationDetected: (locationDetails: AddressDetails) => void;
}

export function GeolocationHandler({ onLocationDetected }: GeolocationHandlerProps) {
  const [isLocating, setIsLocating] = useState(false);
  
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Геолокация не поддерживается вашим браузером");
      return;
    }

    setIsLocating(true);
    toast.info("Получение точного местоположения...");
    
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        console.log("Позиция получена с точностью:", pos.accuracy, "метров");
        
        try {
          // Используем OpenStreetMap's Nominatim API для обратного геокодирования
          const addressDetails = await fetchAddressFromCoordinates(pos.lat, pos.lng);
          console.log("Детали адреса:", addressDetails);
          
          if (addressDetails) {
            toast.success(`Местоположение определено: ${addressDetails.address}`);
            onLocationDetected(addressDetails);
          }
        } catch (error) {
          console.error("Ошибка получения адреса:", error);
          
          // Запасной вариант - использовать координаты как адрес
          const fallbackAddress = `Широта: ${pos.lat.toFixed(6)}, Долгота: ${pos.lng.toFixed(6)}`;
          toast.warning("Не удалось получить адрес, используются координаты");
          
          onLocationDetected({
            address: fallbackAddress,
            latitude: pos.lat,
            longitude: pos.lng
          });
        }
        
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = "Невозможно получить ваше местоположение.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Доступ к местоположению запрещен. Пожалуйста, разрешите доступ к геолокации в настройках браузера.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Информация о местоположении недоступна.";
            break;
          case error.TIMEOUT:
            errorMessage = "Истекло время ожидания запроса на определение местоположения.";
            break;
        }
        
        console.error("Ошибка геолокации:", error.message);
        toast.error(`Ошибка: ${errorMessage}`);
      },
      geoOptions
    );
  };

  return (
    <Button 
      variant="outline"
      size="sm" 
      onClick={handleGetCurrentLocation}
      disabled={isLocating}
      className="w-full"
    >
      {isLocating ? (
        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full mr-2" />
      ) : (
        <Locate className="h-4 w-4 mr-2" />
      )}
      {isLocating ? "Определение местоположения..." : "Обновить местоположение"}
    </Button>
  );
}
