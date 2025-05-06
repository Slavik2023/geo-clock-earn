
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSignIcon, TrendingUp, ChevronRight, Clock, Calendar, AlertTriangle } from "lucide-react";

interface HomeStatisticsProps {
  todayEarnings: number;
  weekEarnings: number;
  totalHours: number;
  sessionsCount: number;
  isLoading: boolean;
  hasOfflineData: boolean;
  connectionError: boolean;
  fadeInUp: any;
}

export function HomeStatistics({ 
  todayEarnings, 
  weekEarnings, 
  totalHours, 
  sessionsCount, 
  isLoading,
  hasOfflineData,
  connectionError,
  fadeInUp 
}: HomeStatisticsProps) {
  return (
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
  );
}
