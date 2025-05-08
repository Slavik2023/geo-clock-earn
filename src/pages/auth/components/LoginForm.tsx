
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
    
    try {
      await loginWithEmail(data.email, data.password);
      toast({
        title: "Login successful!",
        description: "Welcome back.",
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
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
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
    </div>
  );
}
