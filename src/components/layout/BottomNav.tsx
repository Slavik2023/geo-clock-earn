
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, HistoryIcon, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 w-full border-t bg-background px-2 py-2">
      <nav className="flex items-center justify-around">
        <NavItem 
          to="/" 
          icon={<Home size={24} />} 
          label="Home" 
          isActive={location.pathname === "/"} 
        />
        <NavItem 
          to="/tracker" 
          icon={<Clock size={24} />} 
          label="Timer" 
          isActive={location.pathname === "/tracker"} 
        />
        <NavItem 
          to="/history" 
          icon={<HistoryIcon size={24} />} 
          label="History" 
          isActive={location.pathname === "/history"} 
        />
        <NavItem 
          to="/profile" 
          icon={<Settings size={24} />} 
          label="Settings" 
          isActive={location.pathname === "/profile"} 
        />
      </nav>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, isActive }: NavItemProps) {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center px-2 py-1 rounded-md transition-colors",
        isActive 
          ? "text-brand-blue" 
          : "text-gray-500 hover:text-brand-blue-400"
      )}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}
