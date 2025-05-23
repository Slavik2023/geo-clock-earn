
import { supabase } from "@/integrations/supabase/client";
import { createUserSettings } from "./userService";
import { toast } from "sonner";
import { createRecord } from "@/services/recordService"; 

export async function loginWithEmail(email: string, password: string) {
  try {
    console.log("Attempting to login with:", email);
    
    // Make sure the email is lowercase to avoid case-sensitivity issues
    const normalizedEmail = email.toLowerCase().trim();
    
    // Log authentication attempt for debugging
    console.log("Normalized email for login:", normalizedEmail);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      
      // Provide more user-friendly error messages based on the error code
      if (error.message === "Invalid login credentials") {
        throw new Error("Incorrect email or password. Please try again.");
      } else if (error.message.includes("Email not confirmed")) {
        throw new Error("Please verify your email before logging in.");
      }
      throw error;
    }

    if (!data.user || !data.session) {
      console.error("Login successful but no user or session returned:", data);
      throw new Error("Login failed. Please try again.");
    }

    console.log("Login successful:", data);
    return data;
  } catch (error) {
    console.error("Unexpected authentication error:", error);
    throw error;
  }
}

export async function registerWithEmail(email: string, password: string, name?: string) {
  try {
    console.log("Attempting to signup with:", email);
    
    // Make sure the email is lowercase to avoid case-sensitivity issues
    const normalizedEmail = email.toLowerCase().trim();
    
    // Log registration attempt for debugging
    console.log("Normalized email for registration:", normalizedEmail);
    
    // Add metadata with name if provided
    const options = {
      data: name ? { name } : undefined,
      emailRedirectTo: window.location.origin + "/auth"
    };
    
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options
    });

    if (error) {
      console.error("Signup error:", error);
      
      if (error.message.includes("already registered")) {
        throw new Error("This email is already registered. Please log in instead.");
      }
      
      throw error;
    }
    
    if (data.user) {
      console.log("Sign up successful, creating user settings");
      
      try {
        // Create a record for the new user registration
        await createRecord({
          title: "New User Registration",
          description: `User registered with email: ${normalizedEmail}${name ? ` and name: ${name}` : ''}`,
          record_date: new Date().toISOString()
        });
        console.log("User registration record created");

        // Use Supabase Edge Function to create user settings
        // This avoids RLS issues since Edge Functions have admin privileges
        const { origin } = new URL(window.location.href);
        const functionUrl = `${origin}/functions/v1/init-user-settings`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session?.access_token || ''}`
          },
          body: JSON.stringify({
            userId: data.user.id,
            email: normalizedEmail,
            name: name || normalizedEmail.split('@')[0]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Edge function error:", errorData);
          throw new Error(`Failed to initialize user settings: ${errorData.error || 'Unknown error'}`);
        }

        const settingsResult = await response.json();
        console.log("User settings creation result:", settingsResult);
        
        // Show confirmation toast 
        toast.success("Account created successfully! You can now log in.");
        
        return {
          user: data.user,
          settingsCreated: true
        };
      } catch (settingsError) {
        console.error("Error creating user settings:", settingsError);
        // Return success but flag that settings couldn't be created
        toast.warning("Account created but profile setup failed. Please try logging in.");
        return {
          user: data.user,
          settingsCreated: false
        };
      }
    } else {
      console.error("Signup returned no user:", data);
      throw new Error("Could not create user. Please try again.");
    }
  } catch (error) {
    console.error("Unexpected registration error:", error);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: window.location.origin + "/auth",
    });

    if (error) {
      console.error("Password reset error:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Unexpected password reset error:", error);
    throw error;
  }
}
