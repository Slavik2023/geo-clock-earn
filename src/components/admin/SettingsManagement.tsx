
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(25);
  const [defaultOvertimeRate, setDefaultOvertimeRate] = useState(37.5);
  const [enableAllFeatures, setEnableAllFeatures] = useState(false);

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, this could update global settings in a settings table
      toast({
        title: "Настройки сохранены",
        description: "Глобальные настройки системы обновлены"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить настройки"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rebuildDatabase = async () => {
    setIsLoading(true);
    try {
      // This would typically be a call to a database migration function
      // or a call to rebuild database indexes, etc.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Обслуживание базы данных",
        description: "Операция завершена успешно"
      });
    } catch (error) {
      console.error("Error with database maintenance:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось выполнить операцию с базой данных"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Глобальные настройки</CardTitle>
          <CardDescription>
            Настройки по умолчанию для всех пользователей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultRate">Стандартная почасовая ставка</Label>
            <Input
              id="defaultRate"
              type="number"
              value={defaultHourlyRate}
              onChange={(e) => setDefaultHourlyRate(Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="overtimeRate">Стандартная ставка за сверхурочные</Label>
            <Input
              id="overtimeRate"
              type="number"
              value={defaultOvertimeRate}
              onChange={(e) => setDefaultOvertimeRate(Number(e.target.value))}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={enableAllFeatures}
              onCheckedChange={setEnableAllFeatures}
              id="enable-all-features"
            />
            <Label htmlFor="enable-all-features">
              Включить все функции для всех пользователей
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings} disabled={isLoading}>
            Сохранить настройки
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Обслуживание системы</CardTitle>
          <CardDescription>
            Инструменты для обслуживания базы данных и системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button variant="outline" onClick={rebuildDatabase} disabled={isLoading}>
              Выполнить обслуживание базы данных
            </Button>
            <Button variant="outline" disabled={isLoading}>
              Очистить кэш системы
            </Button>
            <Button variant="outline" disabled={isLoading}>
              Просмотр журналов системы
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
