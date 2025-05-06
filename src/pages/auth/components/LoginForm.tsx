
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  onForgotPassword: () => void;
  onSwitchToRegister: () => void;
  loading: boolean;
}

export function LoginForm({ onSubmit, onForgotPassword, onSwitchToRegister, loading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            {loading ? "Logging in..." : "Login"}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Don't have an account? Register
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}
