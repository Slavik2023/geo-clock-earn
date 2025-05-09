
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Clock, History, UserCircle, Settings, Users, Database } from "lucide-react";
import { useAuth } from "@/App";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn(
      "pb-12 min-h-screen hidden md:block",
      className
    )}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold">
            Navigation
          </h2>
          <div className="space-y-1">
            <Link
              to="/"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive('/') ? "bg-accent" : "transparent"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive('/dashboard') ? "bg-accent" : "transparent"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/tracker"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive('/tracker') ? "bg-accent" : "transparent"
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Tracker</span>
            </Link>
            <Link
              to="/records"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive('/records') ? "bg-accent" : "transparent"
              )}
            >
              <Database className="mr-2 h-4 w-4" />
              <span>Records</span>
            </Link>
            <Link
              to="/history"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive('/history') ? "bg-accent" : "transparent"
              )}
            >
              <History className="mr-2 h-4 w-4" />
              <span>History</span>
            </Link>
            <Link
              to="/profile"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive('/profile') ? "bg-accent" : "transparent"
              )}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
            {user && (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive('/admin') ? "bg-accent" : "transparent"
                )}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
