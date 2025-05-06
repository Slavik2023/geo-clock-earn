
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from '@/components/layout/AppLayout';
import { TrackerPage } from "@/pages/TrackerPage";
import { HistoryPage } from "@/pages/history";
import { ProfilePage } from "@/pages/ProfilePage";
import { AuthPage } from "@/pages/auth";
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { syncOfflineSessionsToServer } from "@/components/time-tracker/services/sessionService";
import { toast } from 'sonner';

// Create an auth context to provide user and session data throughout the app
interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Added to fix the error
}

const AuthContext = createContext<AuthContextProps>({ 
  user: null, 
  session: null, 
  loading: true,
  isLoading: true // Added to fix the error
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If a user just signed in, try to sync offline sessions
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            const synced = await syncOfflineSessionsToServer(session.user.id);
            if (synced) {
              toast.success("Your offline sessions have been synced to the server");
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading,
      isLoading: loading // Added to fix the error
    }}>
      <Router>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<TrackerPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
          <Toaster />
        </ThemeProvider>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
