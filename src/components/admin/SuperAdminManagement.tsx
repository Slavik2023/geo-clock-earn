
import { useState } from "react";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/App";

export function SuperAdminManagement() {
  const { user } = useAuth();
  const { isLoading, setSuperAdminStatus } = useSuperAdmin();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSetSuperAdmin = async () => {
    if (!email) {
      // Don't proceed if email is empty
      return;
    }
    const result = await setSuperAdminStatus(email);
    setSuccess(result);
    if (result) {
      // Clear the email field on success
      setEmail("");
    }
  };

  return (
    <Card className="border-2 border-amber-200">
      <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
        <CardTitle className="flex items-center text-amber-700 dark:text-amber-300">
          <Shield className="mr-2" size={20} />
          Настройка главного администратора
        </CardTitle>
        <CardDescription>
          Назначьте главного администратора с полным доступом к системе
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Внимание!</AlertTitle>
          <AlertDescription>
            Главный администратор получит полный доступ к системе и всем её функциям.
            Эти настройки не могут быть изменены другими администраторами.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email главного администратора</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        
        {success && (
          <Alert className="mt-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <AlertTitle>Готово!</AlertTitle>
            <AlertDescription>
              Пользователь успешно назначен главным администратором системы.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4 bg-gray-50 dark:bg-gray-800/50">
        <Button 
          variant="default" 
          className="bg-amber-600 hover:bg-amber-700" 
          onClick={handleSetSuperAdmin}
          disabled={isLoading || !email}
        >
          {isLoading ? "Настройка..." : "Назначить главным администратором"}
        </Button>
      </CardFooter>
    </Card>
  );
}
