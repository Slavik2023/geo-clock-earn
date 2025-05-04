
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkSession } from "./WorkSessionCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { format, getWeek, getMonth, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface AnalyticsCardProps {
  sessions: WorkSession[];
}

export function AnalyticsCard({ sessions }: AnalyticsCardProps) {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [averageHourlyRate, setAverageHourlyRate] = useState(0);
  const [locationData, setLocationData] = useState<any[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    if (!sessions || sessions.length === 0) return;

    // Calculate total earnings and hours
    let earnings = 0;
    let hours = 0;
    const locationMap = new Map();

    // Process daily data
    const dailyMap = new Map();
    
    sessions.forEach(session => {
      // Add to totals
      earnings += session.earnings;
      
      const sessionHours = session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60) 
        : 0;
      
      hours += sessionHours;
      
      // Process for daily chart
      const dateKey = format(session.startTime, 'yyyy-MM-dd');
      const dateLabel = format(session.startTime, 'MMM d');
      
      if (dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          ...dailyMap.get(dateKey),
          earnings: dailyMap.get(dateKey).earnings + session.earnings
        });
      } else {
        dailyMap.set(dateKey, {
          date: dateLabel,
          earnings: session.earnings
        });
      }
      
      // Process location data
      const location = session.location;
      if (locationMap.has(location)) {
        locationMap.set(location, locationMap.get(location) + session.earnings);
      } else {
        locationMap.set(location, session.earnings);
      }
    });
    
    // Convert daily map to array and sort by date
    const dailyArray = Array.from(dailyMap.entries()).map(([_, value]) => value);
    dailyArray.sort((a, b) => a.date.localeCompare(b.date));
    setDailyData(dailyArray.slice(-7)); // Last 7 days
    
    // Convert location map to array for pie chart
    const locationArray = Array.from(locationMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    setLocationData(locationArray);
    
    // Set total values
    setTotalEarnings(earnings);
    setTotalHours(hours);
    setAverageHourlyRate(hours > 0 ? earnings / hours : 0);
    
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Hourly Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageHourlyRate.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Day</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Earnings']} />
                <Bar dataKey="earnings" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
      
      {locationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Location</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {locationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Earnings']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
