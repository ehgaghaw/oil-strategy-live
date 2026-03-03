import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  delay?: number;
}

const MetricCard = ({ label, value, change, positive, icon: Icon, delay = 0 }: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="relative p-5 bg-card border border-border rounded hover:border-gold/30 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          {label}
        </span>
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
      </div>
      <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground animate-count-up">
        {value}
      </div>
      {change && (
        <span className={`text-xs font-mono mt-2 inline-block ${positive ? "text-success" : "text-destructive"}`}>
          {change}
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-px gradient-gold opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default MetricCard;
