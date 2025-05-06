
import { motion } from "framer-motion";

interface HomeGreetingProps {
  userName?: string;
  fadeInUp: any;
}

export function HomeGreeting({ userName, fadeInUp }: HomeGreetingProps) {
  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="mb-6"
    >
      <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-brand-blue to-blue-600 bg-clip-text text-transparent">
        Hello, {userName || 'colleague'}!
      </h1>
      <p className="text-muted-foreground">Ready for a productive day?</p>
    </motion.section>
  );
}
