
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayIcon, HistoryIcon, DollarSignIcon, SettingsIcon, ChevronRight, Clock, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/App";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getOfflineSessions } from "@/components/time-tracker/services/sessionService";

export function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  useEffect(() => {
    // Check for active timer
    const activeTimer = localStorage.getItem("activeTimer");
    if (activeTimer) {
      setIsTimerActive(true);
    }

    // Check for offline sessions
    const offlineSessions = getOfflineSessions();
    if (offlineSessions.length > 0) {
      setHasOfflineData(true);
      calculateOfflineEarnings(offlineSessions);
    }

    // Fetch actual user earnings
    if (user?.id) {
      fetchUserEarnings();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);
  
  const calculateOfflineEarnings = (sessions) => {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get week's date range (last 7 days)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    
    // Filter and calculate
    const todaySessions = sessions.filter(session => 
      new Date(session.startTime) >= today && 
      new Date(session.startTime) < tomorrow
    );
    
    const weekSessions = sessions.filter(session => 
      new Date(session.startTime) >= weekStart && 
      new Date(session.startTime) < tomorrow
    );
    
    // Calculate earnings
    const todaySum = todaySessions.reduce((sum, session) => 
      sum + (session.earnings || 0), 0);
    
    const weekSum = weekSessions.reduce((sum, session) => 
      sum + (session.earnings || 0), 0);
    
    // Set data if we don't already have earnings from the server
    if (todayEarnings === 0) {
      setTodayEarnings(todaySum);
    }
    
    if (weekEarnings === 0) {
      setWeekEarnings(weekSum);
      setSessionsCount(weekSessions.length);
    }
    
    // Calculate total hours
    const totalHoursWorked = sessions.reduce((total, session) => {
      if (session.startTime && session.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);
    
    if (totalHours === 0) {
      setTotalHours(totalHoursWorked);
    }
  };
  
  const fetchUserEarnings = async () => {
    setIsLoading(true);
    let serverDataLoaded = false;
    
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get week's date range (last 7 days)
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 6);
      
      // Test database connection first to avoid multiple error logs
      const { error: pingError } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user?.id)
        .limit(1);
        
      if (pingError) {
        console.error("Database connection test failed:", pingError);
        setConnectionError(true);
        
        // If connection fails, use offline data
        const offlineSessions = getOfflineSessions();
        if (offlineSessions.length > 0) {
          calculateOfflineEarnings(offlineSessions);
        }
        return;
      }
      
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
        serverDataLoaded = true;
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
        setSessionsCount(weekSessions.length);
        serverDataLoaded = true;
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
        serverDataLoaded = true;
      }
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      setConnectionError(true);
    } finally {
      setIsLoading(false);
      
      // If we couldn't load server data, try to use offline data
      if (!serverDataLoaded) {
        const offlineSessions = getOfflineSessions();
        if (offlineSessions.length > 0) {
          calculateOfflineEarnings(offlineSessions);
        }
      }
    }
  };
  
  const handleStartTimer = () => {
    toast({
      title: "Starting workday",
      description: "Going to time tracker...",
    });
    // Redirect to timer page
    window.location.href = "/tracker";
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-brand-blue to-blue-600 bg-clip-text text-transparent">
          Hello, {user?.email?.split('@')[0] || 'colleague'}!
        </h1>
        <p className="text-muted-foreground">Ready for a productive day?</p>
      </motion.section>

      {connectionError && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-700 text-sm flex items-center gap-2"
        >
          <AlertTriangle size={16} />
          <span>Connection to the server failed. Some data may not be up to date.</span>
        </motion.div>
      )}

      {/* Earnings Statistics */}
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
              Today's Earnings
              {hasOfflineData && connectionError && (
                <span className="ml-2 text-xs text-amber-500 flex items-center">
                  <AlertTriangle size={12} className="mr-1" />
                  Local data
                </span>
              )}
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
                  Week: ${weekEarnings.toFixed(2)}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3">
            <div className="flex justify-between w-full items-center">
              <span className="text-sm text-muted-foreground flex items-center">
                <TrendingUp size={16} className="mr-1 text-green-500" />
                Data for the last 7 days
              </span>
              <Button variant="ghost" size="sm" className="text-brand-blue">
                Details <ChevronRight size={16} />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Hours and Sessions Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-3">
                <Clock size={24} className="text-brand-blue" />
              </div>
              {isLoading ? (
                <div className="animate-pulse h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <p className="text-lg font-semibold">{totalHours.toFixed(1)} hrs</p>
              )}
              <p className="text-sm text-muted-foreground">Hours this month</p>
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
                <p className="text-lg font-semibold">{sessionsCount}</p>
              )}
              <p className="text-sm text-muted-foreground">Work sessions</p>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Action Buttons */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
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
                {isTimerActive ? "Timer Active" : "Start Working"}
              </span>
            </div>
          </Button>
          
          <Link to="/history" className="h-24">
            <Button variant="outline" size="lg" className="w-full h-full border-2 hover:border-brand-blue hover:bg-brand-blue/5 transition-all">
              <div className="flex flex-col items-center justify-center">
                <HistoryIcon size={28} className="mb-1 text-brand-blue" />
                <span className="font-medium">Work History</span>
              </div>
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* Quick Access */}
      <motion.section
        initial="hidden"
        animate="visible" 
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Link to="/profile" className="h-full">
            <Card className="h-full border-2 border-transparent hover:border-brand-blue/30 hover:shadow-md transition-all bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <SettingsIcon size={24} className="mb-2 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium">Settings</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/profile" className="h-full">
            <Card className="h-full border-2 border-transparent hover:border-brand-orange/30 hover:shadow-md transition-all bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <DollarSignIcon size={24} className="mb-2 text-brand-orange" />
                <span className="text-sm font-medium">Pricing</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/history?tab=analytics" className="h-full">
            <Card className="h-full border-2 border-transparent hover:border-green-500/30 hover:shadow-md transition-all bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <TrendingUp size={24} className="mb-2 text-green-500" />
                <span className="text-sm font-medium">Analytics</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
