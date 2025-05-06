
import { motion } from "framer-motion";

interface WelcomeBannerProps {
  userName?: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <h1 className="text-3xl font-bold mb-1">
        Welcome, {userName || 'there'}!
      </h1>
      <p className="text-muted-foreground">
        Here's an overview of your recent work and earnings
      </p>
    </motion.div>
  );
}
