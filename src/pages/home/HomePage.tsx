
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/App";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { HomeGreeting } from "./components/HomeGreeting";
import { HomeStatistics } from "./components/HomeStatistics";
import { QuickActions } from "./components/QuickActions";
import { QuickAccess } from "./components/QuickAccess";
import { getOfflineSessions } from "@/components/time-tracker/services/sessionService";
import { useHomePageData } from "./hooks/useHomePageData";

export function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  
  const {
    todayEarnings,
    weekEarnings,
    totalHours,
    sessionsCount,
    isLoading,
    connectionError,
    fetchUserEarnings
  } = useHomePageData(user?.id);
  
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
    }

    // Fetch actual user earnings
    if (user?.id) {
      fetchUserEarnings();
    }
  }, [user?.id, fetchUserEarnings]);
  
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
      <HomeGreeting 
        userName={user?.email?.split('@')[0]} 
        fadeInUp={fadeInUp} 
      />

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
      <HomeStatistics
        todayEarnings={todayEarnings}
        weekEarnings={weekEarnings}
        totalHours={totalHours}
        sessionsCount={sessionsCount}
        isLoading={isLoading}
        hasOfflineData={hasOfflineData}
        connectionError={connectionError}
        fadeInUp={fadeInUp}
      />

      {/* Action Buttons */}
      <QuickActions
        isTimerActive={isTimerActive}
        handleStartTimer={handleStartTimer}
        fadeInUp={fadeInUp}
      />

      {/* Quick Access */}
      <QuickAccess fadeInUp={fadeInUp} />
    </div>
  );
}
