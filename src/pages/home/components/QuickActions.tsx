
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlayIcon, HistoryIcon, StopCircle } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsProps {
  isTimerActive: boolean;
  handleStartTimer: () => void;
  fadeInUp: any;
}

export function QuickActions({ isTimerActive, handleStartTimer, fadeInUp }: QuickActionsProps) {
  const handleStopTimer = () => {
    toast.info("Redirecting to tracker to stop your timer...");
    window.location.href = "/tracker";
  };

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay: 0.2 }}
      className="mt-6"
    >
      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isTimerActive ? (
          <Button
            onClick={handleStopTimer}
            size="lg"
            className="h-24 bg-gradient-to-r from-red-500 to-red-600 border-0 hover:opacity-90 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center justify-center">
              <StopCircle size={28} className="mb-1" />
              <span className="font-medium">Stop Timer</span>
            </div>
          </Button>
        ) : (
          <Button
            onClick={handleStartTimer}
            size="lg"
            className="h-24 bg-gradient-to-r from-brand-blue to-brand-blue-600 border-0 hover:opacity-90 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center justify-center">
              <PlayIcon size={28} className="mb-1" />
              <span className="font-medium">Start Working</span>
            </div>
          </Button>
        )}
        
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
  );
}
