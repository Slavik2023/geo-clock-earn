
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayIcon, HistoryIcon, DollarSignIcon, SettingsIcon } from "lucide-react";
import { EarningsCard } from "@/components/time-tracker/EarningsCard";
import { useToast } from "@/components/ui/use-toast";

export function HomePage() {
  const { toast } = useToast();
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  useEffect(() => {
    // This would typically come from localStorage or a backend API
    // For demo purposes, we'll use hardcoded values
    setTodayEarnings(87.50);
    setWeekEarnings(432.75);
    
    // Check if a timer is already active (e.g., from localStorage)
    const activeTimer = localStorage.getItem("activeTimer");
    if (activeTimer) {
      setIsTimerActive(true);
    }
  }, []);
  
  const handleStartTimer = () => {
    toast({
      title: "Starting your workday",
      description: "Redirecting to the time tracker...",
    });
    // Navigate to the timer page
    window.location.href = "/tracker";
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Today's Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${todayEarnings.toFixed(2)}</div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Week total: ${weekEarnings.toFixed(2)}
            </div>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleStartTimer}
            size="lg"
            className="h-24 bg-brand-blue hover:bg-brand-blue-600"
            disabled={isTimerActive}
          >
            <div className="flex flex-col items-center justify-center">
              <PlayIcon size={24} className="mb-1" />
              <span>
                {isTimerActive ? "Timer Running" : "Start Working"}
              </span>
            </div>
          </Button>
          
          <Link to="/history" className="h-24">
            <Button variant="outline" size="lg" className="w-full h-full">
              <div className="flex flex-col items-center justify-center">
                <HistoryIcon size={24} className="mb-1" />
                <span>Work History</span>
              </div>
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/profile" className="h-full">
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <SettingsIcon size={24} className="mb-2" />
                <span className="text-sm">Settings</span>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <DollarSignIcon size={24} className="mb-2" />
              <span className="text-sm">Pay Rates</span>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
