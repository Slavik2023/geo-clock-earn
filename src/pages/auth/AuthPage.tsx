
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { AuthError } from "./components/AuthError";
import { TestCredentials } from "./components/TestCredentials";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";

export function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "reset">("login");
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Check for recovery token in URL and handle password reset flow
  useEffect(() => {
    const handlePasswordRecovery = async () => {
      const hash = window.location.hash;
      
      // Check if we have a recovery token in the URL
      if (hash && hash.includes('type=recovery')) {
        try {
          // Set active tab to reset password form
          setActiveTab("reset");
          
          // Get the access token
          const accessToken = hash.split('&access_token=')[1]?.split('&')[0];
          
          if (accessToken) {
            // We have a token, store it in Supabase auth
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: '',
            });
          }
        } catch (error) {
          console.error('Error handling password recovery:', error);
          setError('Invalid or expired recovery link. Please request a new password reset.');
        }
      }
    };
    
    handlePasswordRecovery();
  }, []);

  // Redirect to home if already authenticated
  if (user && !loading) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Work Tracker</CardTitle>
          <CardDescription>
            {activeTab === "login" 
              ? "Sign in to your account" 
              : activeTab === "register" 
                ? "Create a new account" 
                : "Reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthError error={error} onDismiss={() => setError(null)} />
          
          {resetEmailSent ? (
            <div className="bg-green-50 p-4 rounded-md mb-4 text-center">
              <p className="text-green-800">
                Password reset email sent! Check your inbox for further instructions.
              </p>
              <button
                onClick={() => {
                  setResetEmailSent(false);
                  setActiveTab("login");
                }}
                className="mt-4 text-sm text-green-600 hover:underline"
              >
                Return to login
              </button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm 
                  onSuccess={() => navigate("/")} 
                  onError={setError}
                  onResetPassword={() => setActiveTab("reset")}
                />
                <TestCredentials />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm 
                  onSuccess={() => navigate("/")} 
                  onError={setError}
                />
              </TabsContent>
              
              <TabsContent value="reset">
                <ResetPasswordForm 
                  onSuccess={() => setResetEmailSent(true)}
                  onError={setError}
                  onCancel={() => setActiveTab("login")}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
