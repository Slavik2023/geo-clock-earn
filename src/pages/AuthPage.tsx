
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/App";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuthentication = async (values: z.infer<typeof formSchema>) => {
    const { email, password } = values;
    setLoading(true);
    setAuthError(null);

    try {
      if (isLogin) {
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

        // The redirect will happen automatically via the AuthContext
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        console.log("Attempting to signup with:", email);
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin, // For email confirmation
          }
        });

        if (error) {
          console.error("Signup error:", error);
          setAuthError(error.message);
          return;
        }

        toast({
          title: "Account created",
          description: "You can now log in with your new account.",
        });
        
        // Switch to login mode after successful signup
        setIsLogin(true);
        form.reset();
      }
    } catch (error) {
      console.error("Unexpected authentication error:", error);
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthError(null);
    form.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 relative">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to WorkTime</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {authError && (
          <Alert variant="destructive" className="bg-red-100 border border-red-200">
            <div className="flex justify-between items-center">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5" />
                <div className="flex flex-col">
                  <div className="font-medium">Authentication Error</div>
                  <AlertDescription>{authError}</AlertDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAuthError(null)}
                className="text-red-500"
              >
                <X size={18} />
              </Button>
            </div>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAuthentication)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your.email@example.com"
                        className="bg-slate-50 h-12"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <Input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-slate-50 h-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </FormItem>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 h-12 font-medium" 
                disabled={loading}
              >
                {loading 
                  ? (isLogin ? "Signing in..." : "Creating account...") 
                  : (isLogin ? "Sign in" : "Create account")}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </form>
        </Form>

        {/* Testing credentials section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-center text-muted-foreground mb-2">Test credentials:</p>
          <div className="bg-slate-50 p-3 rounded-md text-sm">
            <p><strong>Email:</strong> test@example.com</p>
            <p><strong>Password:</strong> password123</p>
            <p className="text-xs text-muted-foreground mt-1">
              For testing purposes only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
