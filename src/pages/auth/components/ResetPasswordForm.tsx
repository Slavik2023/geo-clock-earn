
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { sendPasswordResetEmail } from "@/pages/auth/services/authService";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export interface ResetPasswordFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export function ResetPasswordForm({ onSuccess, onError, onCancel }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      await sendPasswordResetEmail(values.email);
      onSuccess();
    } catch (error) {
      console.error("Password reset error:", error);
      
      if (error instanceof Error) {
        onError(error.message);
      } else {
        onError("An unexpected error occurred during password reset");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
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
                    placeholder="your.email@example.com" 
                    type="email" 
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
