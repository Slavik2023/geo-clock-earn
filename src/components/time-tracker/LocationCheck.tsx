
import { useState, useEffect } from "react";
import { MapPinIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LocationCheckProps {
  onLocationVerified: (verified: boolean) => void;
}

export function LocationCheck({ onLocationVerified }: LocationCheckProps) {
  const [status, setStatus] = useState<"checking" | "verified" | "denied" | "error">("checking");
  const [message, setMessage] = useState("Проверка вашего местоположения...");

  useEffect(() => {
    // Проверка поддержки геолокации
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Геолокация не поддерживается вашим браузером");
      onLocationVerified(false);
      return;
    }

    // Настройки для высокой точности определения местоположения
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    // Запрос позиции пользователя с улучшенными параметрами точности
    console.log("Запрашиваем местоположение с высокой точностью");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // В реальном приложении вы можете проверять позицию относительно известных рабочих мест
        // Для демонстрации просто показываем успешную верификацию
        const accuracy = position.coords.accuracy; // точность в метрах
        console.log(`Местоположение получено с точностью: ${accuracy} метров`);
        
        if (accuracy <= 100) {
          setStatus("verified");
          setMessage(`Местоположение подтверждено (точность: ${accuracy.toFixed(0)} м)`);
          toast.success("Местоположение успешно определено");
        } else {
          setStatus("verified");
          setMessage(`Местоположение получено (точность: ${accuracy.toFixed(0)} м). Для большей точности попробуйте на открытом пространстве.`);
          toast.success("Местоположение определено");
        }
        onLocationVerified(true);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatus("denied");
            setMessage("Доступ к местоположению запрещен. Пожалуйста, разрешите доступ к геолокации.");
            break;
          case error.POSITION_UNAVAILABLE:
            setStatus("error");
            setMessage("Информация о местоположении недоступна.");
            break;
          case error.TIMEOUT:
            setStatus("error");
            setMessage("Время запроса на определение местоположения истекло.");
            break;
          default:
            setStatus("error");
            setMessage("Произошла неизвестная ошибка.");
        }
        console.error("Ошибка геолокации:", error);
        onLocationVerified(false);
      },
      geoOptions
    );
  }, [onLocationVerified]);

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-3 rounded-md",
        status === "checking" && "bg-blue-50 text-blue-600",
        status === "verified" && "bg-green-50 text-green-600",
        status === "denied" && "bg-red-50 text-red-600",
        status === "error" && "bg-yellow-50 text-yellow-600",
      )}
    >
      {status === "checking" && (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
      )}
      {status === "verified" && <CheckCircleIcon className="h-5 w-5" />}
      {status === "denied" && <AlertCircleIcon className="h-5 w-5" />}
      {status === "error" && <AlertCircleIcon className="h-5 w-5" />}
      
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {status === "checking" && "Проверка местоположения"}
          {status === "verified" && "Местоположение подтверждено"}
          {status === "denied" && "Доступ к местоположению запрещен"}
          {status === "error" && "Ошибка определения местоположения"}
        </span>
        <span className="text-xs">{message}</span>
      </div>
    </div>
  );
}
