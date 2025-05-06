
import { supabase } from "@/integrations/supabase/client";
import { createUserSettings } from "./userService";

export async function loginWithEmail(email: string, password: string) {
  try {
    console.log("Attempting to login with:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      throw error;
    }

    console.log("Login successful:", data);
    return data;
  } catch (error) {
    console.error("Unexpected authentication error:", error);
    throw error;
  }
}

export async function registerWithEmail(email: string, password: string) {
  try {
    console.log("Attempting to signup with:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }
    
    if (data.user) {
      console.log("Sign up successful, creating user settings");
      // Create user settings in the database
      return {
        user: data.user,
        settingsCreated: await createUserSettings(data.user.id, email)
      };
    } else {
      throw new Error("Could not create user. Please try again.");
    }
  } catch (error) {
    console.error("Unexpected registration error:", error);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
