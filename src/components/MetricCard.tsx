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
      transition={{ delay, duration: 0.4 }}
      className="relative bg-oil-light border border-border p-5 group hover:border-gold/20 transition-all duration-300"
    >
      {/* Gold accent line on hover */}
      <div className="absolute top-0 left-0 w-0 h-[2px] gradient-gold group-hover:w-full transition-all duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 bg-oil-sheen flex items-center justify-center">
          <Icon className="w-4 h-4 text-gold-muted group-hover:text-gold transition-colors" />
        </div>
        {change && (
          <span className={`font-mono text-xs px-2 py-0.5 ${
            positive
              ? "text-gold bg-gold/10"
              : "text-destructive bg-destructive/10"
          }`}>
            {change}
          </span>
        )}
      </div>

      <span className="font-mono text-[10px] text-gold-muted tracking-[0.2em] uppercase block mb-1">
        {label}
      </span>
      <div className="font-mono text-xl sm:text-2xl font-bold text-foreground">
        {value}
      </div>
    </motion.div>
  );
};

export default MetricCard;
