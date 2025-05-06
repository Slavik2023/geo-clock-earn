
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/App";
import {
  DollarSignIcon,
  ClockIcon,
  CalendarIcon,
  ActivityIcon,
  TrendingUpIcon
} from "lucide-react";
import { RecentSessionsList } from "./components/RecentSessionsList";
import { EarningsChart } from "./components/EarningsChart";
import { supabase } from '@/integrations/supabase/client';
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { EarningsSummary } from "./components/EarningsSummary";
import { StatsGrid } from "./components/StatsGrid";
import { WelcomeBanner } from "./components/WelcomeBanner";

export function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    todayHours: 0,
    weekHours: 0,
    monthHours: 0,
    totalSessions: 0,
    averageHourlyRate: 0,
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch sessions data
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*, locations(name)")
          .eq("user_id", user.id)
          .order("start_time", { ascending: false })
          .limit(10);

        if (error) throw error;

        // Transform data to WorkSession format
        const workSessions = data.map(session => ({
          id: session.id,
          startTime: new Date(session.start_time),
          endTime: session.end_time ? new Date(session.end_time) : undefined,
          location: session.locations?.name || session.address || "Unknown location",
          earnings: session.earnings || 0,
        }));

        setSessions(workSessions);
        calculateStats(workSessions);

      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load session data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user, toast]);

  const calculateStats = (sessions: WorkSession[]) => {
    // Get today, this week, and this month date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Filter sessions by date ranges
    const todaySessions = sessions.filter(s => s.startTime >= today);
    const weekSessions = sessions.filter(s => s.startTime >= weekStart);
    const monthSessions = sessions.filter(s => s.startTime >= monthStart);

    // Calculate earnings and hours
    const calcEarnings = (sessions: WorkSession[]) => 
      sessions.reduce((sum, s) => sum + s.earnings, 0);
    
    const calcHours = (sessions: WorkSession[]) => 
      sessions.reduce((sum, s) => {
        if (!s.endTime) return sum;
        const durationHours = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60 * 60);
        return sum + durationHours;
      }, 0);

    // Calculate average hourly rate
    const totalHours = calcHours(sessions);
    const totalEarnings = calcEarnings(sessions);
    const avgHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;

    setStats({
      todayEarnings: calcEarnings(todaySessions),
      weekEarnings: calcEarnings(weekSessions),
      monthEarnings: calcEarnings(monthSessions),
      todayHours: calcHours(todaySessions),
      weekHours: calcHours(weekSessions),
      monthHours: calcHours(monthSessions),
      totalSessions: sessions.length,
      averageHourlyRate: avgHourlyRate,
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <WelcomeBanner userName={user?.email?.split('@')[0]} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <StatsGrid stats={stats} />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-muted-foreground" />
                Recent Sessions
              </CardTitle>
              <CardDescription>Your most recent work sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSessionsList sessions={sessions} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EarningsSummary stats={stats} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-muted-foreground" />
                Earnings Trend
              </CardTitle>
              <CardDescription>Your earnings over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <EarningsChart sessions={sessions} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
