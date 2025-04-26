
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      console.log("Attempting to login with:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setAuthError(error.message);
        return;
      }

      navigate("/");
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error) {
      console.error("Unexpected login error:", error);
      setAuthError(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      console.log("Attempting to signup with:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Signup error:", error);
        setAuthError(error.message);
        return;
      }

      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
    } catch (error) {
      console.error("Unexpected signup error:", error);
      setAuthError(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 relative">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to WorkTime</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {authError && (
          <Alert variant="destructive" className="bg-red-100 border border-red-200">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="font-medium">Error</div>
                <AlertDescription>{authError}</AlertDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAuthError(null)}
                className="text-red-500"
              >
                <X size={20} />
              </Button>
            </div>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-50 h-12"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600 h-12 font-medium" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 font-medium"
              onClick={handleSignUp}
              disabled={loading}
            >
              Create account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
