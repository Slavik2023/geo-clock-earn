
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSubmit: (values: ResetPasswordFormValues) => void;
  onBack: () => void;
  loading: boolean;
  defaultEmail?: string;
}

export function ResetPasswordForm({ onSubmit, onBack, loading, defaultEmail = "" }: ResetPasswordFormProps) {
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: defaultEmail
    }
  });

  return (
    <Form {...resetPasswordForm}>
      <form onSubmit={resetPasswordForm.handleSubmit(onSubmit)} className="space-y-6">
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
            onClick={onBack}
            className="flex items-center text-sm text-blue-600 hover:underline font-medium"
          >
            <ArrowLeft size={16} className="mr-1" /> Return to Login
          </button>
        </div>
      </form>
    </Form>
  );
}
