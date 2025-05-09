
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginWithEmail } from "@/pages/auth/services/authService";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthError } from "./AuthError";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onResetPassword?: () => void;
}

export function LoginForm({ onSwitchToRegister, onSwitchToReset, onSuccess, onError, onResetPassword }: LoginFormProps) {
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    setDebugInfo(null);
    
    try {
      console.log("Submitting login form with email:", data.email);
      
      const result = await loginWithEmail(data.email, data.password);
      
      // Show debug info in development
      if (process.env.NODE_ENV === 'development') {
        setDebugInfo(`Login successful. User: ${result?.user?.id}`);
      }
      
      toast.success("Login successful!", {
        description: "Welcome back."
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "An error occurred during login";
      setAuthError(errorMessage);
      
      // Show debug info in development
      if (process.env.NODE_ENV === 'development') {
        setDebugInfo(`Error details: ${JSON.stringify(error)}`);
      }
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast.error("Login failed", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (onResetPassword) {
      onResetPassword();
    } else {
      onSwitchToReset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your credentials to sign in to your account
        </p>
      </div>

      {authError && <AuthError message={authError} />}
      
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-mono">
            {debugInfo}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="you@example.com" 
                    type="email" 
                    autoComplete="email"
                    disabled={isLoading} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="********" 
                    type="password" 
                    autoComplete="current-password"
                    disabled={isLoading} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        <Button variant="link" onClick={handleResetPassword} className="px-2">
          Forgot password?
        </Button>
        <span className="px-2">•</span>
        <Button variant="link" onClick={onSwitchToRegister} className="px-2">
          Create an account
        </Button>
      </div>
      
      {/* Test credentials notice */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm border">
        <p className="text-gray-600 font-medium">Test credentials:</p>
        <p className="text-gray-500">Email: test@example.com</p>
        <p className="text-gray-500">Password: password123</p>
        <p className="text-xs text-gray-400 mt-1">You may need to register first</p>
      </div>
    </div>
  );
}
