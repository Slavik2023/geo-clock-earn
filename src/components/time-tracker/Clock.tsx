
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const formattedHours = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  const formattedTime = `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="clock-container w-64 h-64">
        <div className="clock-inner w-56 h-56">
          <div className="text-center">
            <div className="text-4xl font-bold">{formattedTime}</div>
            <div className="text-xl">{ampm}</div>
            <div className="text-sm mt-2">
              {time.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
