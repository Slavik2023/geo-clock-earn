
import { Link, useLocation } from "react-router-dom";
import { Home, Clock, History, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("is_admin, role")
          .eq("user_id", user.id)
          .single();
        
        // User is admin if is_admin is true OR role is 'admin' or 'super_admin'
        setIsAdmin(
          data?.is_admin || 
          data?.role === 'admin' || 
          data?.role === 'super_admin'
        );
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: <Home className="h-5 w-5" />
    },
    {
      label: "Tracker",
      path: "/tracker",
      icon: <Clock className="h-5 w-5" />
    },
    {
      label: "History",
      path: "/history",
      icon: <History className="h-5 w-5" />
    },
    {
      label: "Profile",
      path: "/profile",
      icon: <User className="h-5 w-5" />
    }
  ];
  
  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({
      label: "Admin",
      path: "/admin",
      icon: <Settings className="h-5 w-5" />
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-10">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-1 flex-col items-center py-2 text-xs",
              location.pathname === item.path
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
