
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
import { registerWithEmail } from "@/pages/auth/services/authService";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthError } from "./AuthError";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the registration form schema
const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  confirmPassword: z.string(),
  terms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function RegisterForm({ onSwitchToLogin, onSuccess, onError }: RegisterFormProps) {
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Initialize the form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    setDebugInfo(null);
    
    try {
      console.log("Submitting registration form with email:", data.email);
      
      const result = await registerWithEmail(data.email, data.password);
      
      // Show registration success information
      setRegistrationComplete(true);
      
      // Show debug info in development
      if (process.env.NODE_ENV === 'development') {
        setDebugInfo(`Registration successful. User: ${result?.user?.id}`);
      }
      
      toast.success("Registration successful!", {
        description: "Your account has been created. You may now log in."
      });
      
      // Switch to login view after a short delay
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "An error occurred during registration";
      setAuthError(errorMessage);
      
      // Show debug info in development
      if (process.env.NODE_ENV === 'development') {
        setDebugInfo(`Error details: ${JSON.stringify(error)}`);
      }
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast.error("Registration failed", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your details to register for an account
        </p>
      </div>

      {authError && <AuthError message={authError} />}
      
      {registrationComplete && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Registration successful! You can now log in with your credentials.
          </AlertDescription>
        </Alert>
      )}
      
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
                    disabled={isLoading || registrationComplete} 
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
                    autoComplete="new-password"
                    disabled={isLoading || registrationComplete} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="********" 
                    type="password" 
                    autoComplete="new-password"
                    disabled={isLoading || registrationComplete} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading || registrationComplete}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm">
                    I agree to the terms of service and privacy policy
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || registrationComplete}
          >
            {isLoading ? "Creating account..." : (registrationComplete ? "Account Created" : "Create Account")}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        <span>Already have an account?</span>
        <Button variant="link" onClick={onSwitchToLogin} className="px-2">
          Sign in
        </Button>
      </div>
    </div>
  );
}
