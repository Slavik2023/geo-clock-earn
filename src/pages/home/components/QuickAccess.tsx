
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { SettingsIcon, DollarSignIcon, TrendingUp } from "lucide-react";

interface QuickAccessProps {
  fadeInUp: any;
}

export function QuickAccess({ fadeInUp }: QuickAccessProps) {
  return (
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
  );
}
