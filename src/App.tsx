import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { TrackerPage } from "@/pages/TrackerPage";
import { HistoryPage } from "./pages/history";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminPage } from "@/pages/AdminPage";
import { AuthPage } from "@/pages/AuthPage";
import NotFound from "./pages/NotFound";
import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";

const queryClient = new QueryClient();

// Create auth context to share authentication state across components
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

// Authentication Provider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to ensure user settings exist
  const ensureUserSettings = async (currentUser: User) => {
    try {
      // First check if user settings already exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking user settings:", checkError);
        return;
      }
      
      // If settings don't exist, create them
      if (!existingSettings) {
        console.log("No user settings found, creating...");
        const email = currentUser.email || '';
        
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: currentUser.id,
            name: email.split('@')[0], // Use part of email as initial name
            hourly_rate: 25,
            overtime_rate: 37.5,
            overtime_threshold: 8,
            enable_location_verification: true,
            enable_overtime_calculation: true,
            role: 'user',
            is_admin: false
          });
        
        if (insertError) {
          console.error("Error creating user settings:", insertError);
          toast.error("Failed to set up your profile. Some features may be limited.");
        } else {
          console.log("User settings created successfully");
        }
      } else {
        console.log("User settings exist:", existingSettings);
      }
    } catch (error) {
      console.error("Error in ensureUserSettings:", error);
    }
  };

  useEffect(() => {
    console.log("Setting up auth provider...");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        if (currentSession) {
          // Only update state if there's a valid session
          console.log("Auth state change: Got valid session", currentSession);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // When user signs in, ensure they have user settings
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Use setTimeout to prevent potential deadlock with Supabase auth state changes
            setTimeout(() => {
              ensureUserSettings(currentSession.user);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear state on sign out
          console.log("Auth state change: User signed out");
          setSession(null);
          setUser(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Checking for existing session...");
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Restored existing session for user:", data.session.user.email);
          setSession(data.session);
          setUser(data.session.user);
          
          // Ensure user settings exist for the restored session
          setTimeout(() => {
            ensureUserSettings(data.session.user);
          }, 0);
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<HomePage />} />
              <Route path="tracker" element={<TrackerPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
