
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayIcon, HistoryIcon, DollarSignIcon, SettingsIcon, ChevronRight, Clock, Calendar, TrendingUp } from "lucide-react";
import { EarningsCard } from "@/components/time-tracker/EarningsCard";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/App";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for active timer
    const activeTimer = localStorage.getItem("activeTimer");
    if (activeTimer) {
      setIsTimerActive(true);
    }

    // Fetch actual user earnings
    if (user?.id) {
      fetchUserEarnings();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);
  
  const fetchUserEarnings = async () => {
    setIsLoading(true);
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get week's date range (last 7 days)
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 6);
      
      // Fetch today's earnings
      const { data: todaySessions, error: todayError } = await supabase
        .from("sessions")
        .select("earnings")
        .eq("user_id", user?.id)
        .gte("start_time", today.toISOString())
        .lt("start_time", tomorrow.toISOString());
      
      if (todayError) {
        console.error("Error fetching today's earnings:", todayError);
      } else {
        const todaySum = todaySessions.reduce((sum, session) => 
          sum + (session.earnings || 0), 0);
        setTodayEarnings(todaySum);
      }
      
      // Fetch week's earnings
      const { data: weekSessions, error: weekError } = await supabase
        .from("sessions")
        .select("earnings")
        .eq("user_id", user?.id)
        .gte("start_time", weekStart.toISOString())
        .lt("start_time", tomorrow.toISOString());
      
      if (weekError) {
        console.error("Error fetching week's earnings:", weekError);
      } else {
        const weekSum = weekSessions.reduce((sum, session) => 
          sum + (session.earnings || 0), 0);
        setWeekEarnings(weekSum);
      }
      
      // Calculate total hours worked this month
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const { data: monthSessions, error: monthError } = await supabase
        .from("sessions")
        .select("start_time, end_time")
        .eq("user_id", user?.id)
        .gte("start_time", monthStart.toISOString())
        .lte("start_time", monthEnd.toISOString());
      
      if (monthError) {
        console.error("Error fetching month's sessions:", monthError);
      } else if (monthSessions) {
        let totalHoursWorked = 0;
        
        monthSessions.forEach(session => {
          if (session.start_time && session.end_time) {
            const start = new Date(session.start_time);
            const end = new Date(session.end_time);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            totalHoursWorked += hours;
          }
        });
        
        setTotalHours(totalHoursWorked);
      }
      
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartTimer = () => {
    toast({
      title: "Начинаем рабочий день",
      description: "Переходим к трекеру времени...",
    });
    // Перенаправление на страницу с таймером
    window.location.href = "/tracker";
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-brand-blue to-blue-600 bg-clip-text text-transparent">
          Привет, {user?.email?.split('@')[0] || 'коллега'}!
        </h1>
        <p className="text-muted-foreground">Готовы к продуктивному дню?</p>
      </motion.section>

      {/* Статистика заработка */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="flex items-center text-xl">
              <DollarSignIcon className="mr-2 text-brand-orange" size={20} /> 
              Заработок сегодня
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-12">
                <div className="animate-pulse h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold text-brand-blue">${todayEarnings.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Неделя: ${weekEarnings.toFixed(2)}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3">
            <div className="flex justify-between w-full items-center">
              <span className="text-sm text-muted-foreground flex items-center">
                <TrendingUp size={16} className="mr-1 text-green-500" />
                Данные за последние 7 дней
              </span>
              <Button variant="ghost" size="sm" className="text-brand-blue">
                Детали <ChevronRight size={16} />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Карточки часов и сессий */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-3">
                <Clock size={24} className="text-brand-blue" />
              </div>
              {isLoading ? (
                <div className="animate-pulse h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <p className="text-lg font-semibold">{totalHours.toFixed(1)} ч</p>
              )}
              <p className="text-sm text-muted-foreground">Часов в этом месяце</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3 mb-3">
                <Calendar size={24} className="text-brand-orange" />
              </div>
              {isLoading ? (
                <div className="animate-pulse h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <p className="text-lg font-semibold">{Math.max(0, weekSessions ? weekSessions.length : 0)}</p>
              )}
              <p className="text-sm text-muted-foreground">Рабочих сессий</p>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Кнопки действий */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <h2 className="text-lg font-semibold mb-3">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleStartTimer}
            size="lg"
            className="h-24 bg-gradient-to-r from-brand-blue to-brand-blue-600 border-0 hover:opacity-90 shadow-md hover:shadow-lg transition-all"
            disabled={isTimerActive}
          >
            <div className="flex flex-col items-center justify-center">
              <PlayIcon size={28} className="mb-1" />
              <span className="font-medium">
                {isTimerActive ? "Таймер активен" : "Начать работу"}
              </span>
            </div>
          </Button>
          
          <Link to="/history" className="h-24">
            <Button variant="outline" size="lg" className="w-full h-full border-2 hover:border-brand-blue hover:bg-brand-blue/5 transition-all">
              <div className="flex flex-col items-center justify-center">
                <HistoryIcon size={28} className="mb-1 text-brand-blue" />
                <span className="font-medium">История работы</span>
              </div>
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* Быстрый доступ */}
      <motion.section
        initial="hidden"
        animate="visible" 
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <h2 className="text-lg font-semibold mb-3">Быстрый доступ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Link to="/profile" className="h-full">
            <Card className="h-full border-2 border-transparent hover:border-brand-blue/30 hover:shadow-md transition-all bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <SettingsIcon size={24} className="mb-2 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium">Настройки</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/profile" className="h-full">
            <Card className="h-full border-2 border-transparent hover:border-brand-orange/30 hover:shadow-md transition-all bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <DollarSignIcon size={24} className="mb-2 text-brand-orange" />
                <span className="text-sm font-medium">Тарифы</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/history?tab=analytics" className="h-full">
            <Card className="h-full border-2 border-transparent hover:border-green-500/30 hover:shadow-md transition-all bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <TrendingUp size={24} className="mb-2 text-green-500" />
                <span className="text-sm font-medium">Аналитика</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
