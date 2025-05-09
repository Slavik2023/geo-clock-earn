
import { Link, useLocation } from 'react-router-dom';
import { Home, Clock, History, UserCircle, Database } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary" : "text-muted-foreground";
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
      <div className="grid h-full grid-cols-5">
        <Link to="/" className="flex flex-col items-center justify-center">
          <Home className={`h-5 w-5 ${isActive('/')}`} />
          <span className={`text-xs mt-1 ${isActive('/')}`}>Home</span>
        </Link>
        <Link to="/tracker" className="flex flex-col items-center justify-center">
          <Clock className={`h-5 w-5 ${isActive('/tracker')}`} />
          <span className={`text-xs mt-1 ${isActive('/tracker')}`}>Tracker</span>
        </Link>
        <Link to="/records" className="flex flex-col items-center justify-center">
          <Database className={`h-5 w-5 ${isActive('/records')}`} />
          <span className={`text-xs mt-1 ${isActive('/records')}`}>Records</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center justify-center">
          <History className={`h-5 w-5 ${isActive('/history')}`} />
          <span className={`text-xs mt-1 ${isActive('/history')}`}>History</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center">
          <UserCircle className={`h-5 w-5 ${isActive('/profile')}`} />
          <span className={`text-xs mt-1 ${isActive('/profile')}`}>Profile</span>
        </Link>
      </div>
    </div>
  );
}
