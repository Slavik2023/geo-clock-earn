
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/App";

import { LoginForm, LoginFormValues } from "./components/LoginForm";
import { RegisterForm, RegisterFormValues } from "./components/RegisterForm";
import { ResetPasswordForm, ResetPasswordFormValues } from "./components/ResetPasswordForm";
import { AuthError } from "./components/AuthError";
import { TestCredentials } from "./components/TestCredentials";
import { loginWithEmail, registerWithEmail, resetPassword } from "./services/authService";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User already authenticated, redirecting to home");
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    setAuthError(null);

    try {
      await loginWithEmail(values.email, values.password);
      toast.success("Successfully logged in!");
      // The redirect will happen automatically via the AuthContext
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    setAuthError(null);

    try {
      const { settingsCreated } = await registerWithEmail(values.email, values.password);
      
      if (settingsCreated) {
        toast.success("Account created successfully! You can now log in.");
      } else {
        toast.warning("Account created but profile setup failed. Please try logging in.");
      }
      
      // Switch to login mode after successful signup
      setIsLogin(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Registration error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (values: ResetPasswordFormValues) => {
    setLoading(true);
    setAuthError(null);

    try {
      await resetPassword(values.email);
      toast.success("Password reset link sent. Check your email to reset your password.");
      setIsForgotPassword(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Password reset error");
    } finally {
      setLoading(false);
    }
  };

  const switchToForgotPassword = () => {
    setIsForgotPassword(true);
    setAuthError(null);
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setAuthError(null);
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setAuthError(null);
  };

  const returnToLogin = () => {
    setIsForgotPassword(false);
    setAuthError(null);
  };

  // If still checking authentication state, show loading
  if (authLoading) {
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

        <AuthError error={authError} onDismiss={() => setAuthError(null)} />

        {isForgotPassword ? (
          <ResetPasswordForm 
            onSubmit={handlePasswordReset} 
            onBack={returnToLogin} 
            loading={loading} 
          />
        ) : isLogin ? (
          <LoginForm 
            onSubmit={handleLogin}
            onForgotPassword={switchToForgotPassword}
            onSwitchToRegister={switchToRegister}
            loading={loading}
          />
        ) : (
          <RegisterForm 
            onSubmit={handleRegister}
            onSwitchToLogin={switchToLogin}
            loading={loading}
          />
        )}

        <TestCredentials />
      </div>
    </div>
  );
}
