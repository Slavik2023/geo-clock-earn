
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, X, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/App";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { user, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  // Check if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      console.log("User already authenticated, redirecting to home");
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const createUserSettings = async (userId: string, email: string) => {
    try {
      console.log("Creating user settings for:", userId, email);
      
      // First check if user settings already exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking user settings:", checkError);
        throw checkError;
      }
      
      if (existingSettings) {
        console.log("User settings already exist, no need to create");
        return;
      }
      
      // Create new user settings
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
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
        throw insertError;
      }
      
      console.log("User settings created successfully");
      return true;
    } catch (error) {
      console.error("Error creating user settings:", error);
      toast.error("Your account was created but we couldn't set up your profile. Please contact support.");
      return false;
    }
  };

  const handleAuthentication = async (values: z.infer<typeof formSchema>) => {
    const { email, password } = values;
    setLoading(true);
    setAuthError(null);

    try {
      if (isLogin) {
        console.log("Attempting to login with:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Login error:", error);
          setAuthError(error.message || "Authentication failed. Please check your credentials.");
          setLoading(false);
          return;
        }

        console.log("Login successful:", data);
        // The redirect will happen automatically via the AuthContext
        toast.success("Successfully logged in!");
      } else {
        console.log("Attempting to signup with:", email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error("Signup error:", error);
          setAuthError(error.message || "Sign up failed. Please try again.");
          setLoading(false);
          return;
        }
        
        if (data.user) {
          console.log("Sign up successful, creating user settings");
          
          // Create user settings in the database
          const settingsCreated = await createUserSettings(data.user.id, email);
          
          if (settingsCreated) {
            toast.success("Account created successfully! You can now log in.");
            // Switch to login mode after successful signup
            setIsLogin(true);
            form.reset();
          } else {
            toast.warning("Account created but profile setup failed. Please try logging in.");
            setIsLogin(true);
            form.reset();
          }
        } else {
          setAuthError("Could not create user. Please try again.");
        }
      }
    } catch (error) {
      console.error("Unexpected authentication error:", error);
      setAuthError(error instanceof Error ? error.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (values: z.infer<typeof resetPasswordSchema>) => {
    const { email } = values;
    setLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth",
      });

      if (error) {
        console.error("Password reset error:", error);
        setAuthError(error.message || "Password reset failed. Please try again.");
        return;
      }

      toast.success("Password reset link sent. Check your email to reset your password.");
      
      // Switch back to login mode
      setIsForgotPassword(false);
      resetPasswordForm.reset();
    } catch (error) {
      console.error("Unexpected password reset error:", error);
      setAuthError(error instanceof Error ? error.message : "Password reset error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthError(null);
    form.reset();
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setAuthError(null);
    if (!isForgotPassword) {
      resetPasswordForm.setValue("email", form.getValues("email"));
    }
  };

  // If still checking authentication state, show loading
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Checking authentication status...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 relative">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to WorkTime</h1>
          <p className="text-muted-foreground mt-2">
            {isForgotPassword 
              ? "Password Recovery" 
              : (isLogin ? "Login to your account" : "Create a new account")}
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

        {isForgotPassword ? (
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(handlePasswordReset)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
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
              </div>

              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600 h-12 font-medium" 
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Password Reset Link"}
                </Button>
                
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="flex items-center text-sm text-blue-600 hover:underline font-medium"
                >
                  <ArrowLeft size={16} className="mr-1" /> Return to Login
                </button>
              </div>
            </form>
          </Form>
        ) : (
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
                    ? (isLogin ? "Logging in..." : "Creating account...") 
                    : (isLogin ? "Login" : "Create Account")}
                </Button>
                
                {isLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={toggleForgotPassword}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    {isLogin 
                      ? "Don't have an account? Register" 
                      : "Already have an account? Login"}
                  </button>
                </div>
              </div>
            </form>
          </Form>
        )}

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
