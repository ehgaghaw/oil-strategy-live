import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets } from "lucide-react";

const OilSplashIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"logo" | "spill" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spill"), 1200);
    const t2 = setTimeout(() => setPhase("done"), 3000);
    const t3 = setTimeout(onComplete, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "hsl(0 0% 3%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Oil spill expanding from center */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={phase === "spill" ? { opacity: 1 } : {}}
          >
            {/* Main oil spill - top */}
            <motion.div
              className="absolute left-0 right-0 top-0"
              style={{
                background: "linear-gradient(180deg, hsl(40 30% 8%) 0%, hsl(35 40% 14%) 40%, hsl(43 72% 52% / 0.3) 70%, transparent 100%)",
              }}
              initial={{ height: 0 }}
              animate={phase === "spill" ? { height: "100vh" } : {}}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Oil drip streams */}
            {[10, 25, 40, 55, 70, 85].map((left, i) => (
              <motion.div
                key={left}
                className="absolute top-0"
                style={{
                  left: `${left}%`,
                  width: `${8 + i * 3}px`,
                  background: "linear-gradient(180deg, hsl(35 40% 14%), hsl(43 72% 52% / 0.15), transparent)",
                  borderRadius: "0 0 50% 50%",
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={phase === "spill" ? { height: "100vh", opacity: [0, 0.8, 0.4] } : {}}
                transition={{
                  duration: 1.2 + i * 0.15,
                  delay: 0.1 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}

            {/* Gold shimmer wave */}
            <motion.div
              className="absolute left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(43 72% 52% / 0.6), transparent)",
              }}
              initial={{ top: 0, opacity: 0 }}
              animate={phase === "spill" ? { top: "100%", opacity: [0, 1, 0] } : {}}
              transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
            />
          </motion.div>

          {/* Center logo */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              phase === "logo"
                ? { scale: 1, opacity: 1 }
                : { scale: 1.2, opacity: 0, y: -60 }
            }
            transition={
              phase === "logo"
                ? { duration: 0.6, ease: "easeOut" }
                : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {/* Oil drop icon */}
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: "radial-gradient(circle at 40% 35%, hsl(43 72% 52%), hsl(38 60% 38%), hsl(30 20% 5%))",
                boxShadow: "0 0 60px hsl(43 72% 52% / 0.3), 0 0 120px hsl(43 72% 52% / 0.1)",
              }}
              animate={{
                boxShadow: [
                  "0 0 60px hsl(43 72% 52% / 0.3), 0 0 120px hsl(43 72% 52% / 0.1)",
                  "0 0 80px hsl(43 72% 52% / 0.5), 0 0 160px hsl(43 72% 52% / 0.2)",
                  "0 0 60px hsl(43 72% 52% / 0.3), 0 0 120px hsl(43 72% 52% / 0.1)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Droplets className="w-10 h-10 text-primary-foreground" />
            </motion.div>

            <motion.span
              className="font-display text-2xl font-bold text-gold tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              OIL STRATEGY
            </motion.span>
            <motion.span
              className="font-mono text-[10px] text-gold-muted tracking-[0.4em] mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              TERMINAL
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OilSplashIntro;
