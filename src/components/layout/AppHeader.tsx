
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Determine the title based on the current route
  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return "WorkTime Dashboard";
      case "/tracker":
        return "Time Tracker";
      case "/history":
        return "Work History";
      case "/profile":
        return "Profile & Settings";
      default:
        return "WorkTime Tracker";
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-10 w-full bg-background border-b px-4 py-3",
    )}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{getTitle()}</h1>
      </div>
    </header>
  );
}
