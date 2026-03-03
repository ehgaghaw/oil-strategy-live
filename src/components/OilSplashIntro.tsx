import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import oilLogo from "@/assets/oil-logo.png";

const OilSplashIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"logo" | "flip" | "pour" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("flip"), 1400);
    const t2 = setTimeout(() => setPhase("pour"), 2400);
    const t3 = setTimeout(() => setPhase("done"), 4200);
    const t4 = setTimeout(onComplete, 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
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
          {/* Oil pouring down from flipped logo */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={phase === "pour" ? { opacity: 1 } : {}}
          >
            {/* Main oil curtain pouring from top center */}
            <motion.div
              className="absolute left-0 right-0 top-0"
              style={{
                background: "linear-gradient(180deg, hsl(30 20% 5%) 0%, hsl(35 40% 14% / 0.8) 20%, hsl(40 30% 8% / 0.6) 50%, hsl(43 72% 52% / 0.15) 80%, transparent 100%)",
              }}
              initial={{ height: 0 }}
              animate={phase === "pour" ? { height: "100vh" } : {}}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Oil drip streams - thicker, more viscous */}
            {[8, 18, 30, 42, 50, 58, 68, 80, 92].map((left, i) => (
              <motion.div
                key={left}
                className="absolute top-0"
                style={{
                  left: `${left}%`,
                  width: `${12 + (i % 3) * 8}px`,
                  background: `linear-gradient(180deg, hsl(30 20% 5%), hsl(35 40% 14% / ${0.6 + (i % 3) * 0.15}), hsl(43 72% 52% / 0.08), transparent)`,
                  borderRadius: "0 0 50% 50%",
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={phase === "pour" ? { height: "110vh", opacity: [0, 0.9, 0.5] } : {}}
                transition={{
                  duration: 1.0 + i * 0.1,
                  delay: i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}

            {/* Gold shimmer line */}
            <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent 10%, hsl(43 72% 52% / 0.5) 30%, hsl(45 80% 64% / 0.7) 50%, hsl(43 72% 52% / 0.5) 70%, transparent 90%)",
              }}
              initial={{ top: 0, opacity: 0 }}
              animate={phase === "pour" ? { top: "100%", opacity: [0, 1, 0] } : {}}
              transition={{ duration: 1.6, delay: 0.2, ease: "easeOut" }}
            />
          </motion.div>

          {/* Center logo - shows, then flips upside down, then pours */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            animate={
              phase === "logo"
                ? { scale: 1, opacity: 1, rotateX: 0, y: 0 }
                : phase === "flip"
                ? { scale: 1.05, opacity: 1, rotateX: 180, y: -20 }
                : { scale: 0.6, opacity: 0, rotateX: 180, y: -200 }
            }
            initial={{ scale: 0.7, opacity: 0, rotateX: 0, y: 0 }}
            transition={
              phase === "logo"
                ? { duration: 0.7, ease: "easeOut" }
                : phase === "flip"
                ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0.6, ease: "easeIn" }
            }
            style={{ perspective: 800 }}
          >
            <motion.img
              src={oilLogo}
              alt="Oil Strategy"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-6"
              style={{
                filter: "drop-shadow(0 0 40px hsl(43 72% 52% / 0.4)) drop-shadow(0 0 80px hsl(43 72% 52% / 0.15))",
              }}
              animate={{
                filter: [
                  "drop-shadow(0 0 40px hsl(43 72% 52% / 0.4)) drop-shadow(0 0 80px hsl(43 72% 52% / 0.15))",
                  "drop-shadow(0 0 60px hsl(43 72% 52% / 0.6)) drop-shadow(0 0 120px hsl(43 72% 52% / 0.25))",
                  "drop-shadow(0 0 40px hsl(43 72% 52% / 0.4)) drop-shadow(0 0 80px hsl(43 72% 52% / 0.15))",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.span
              className="font-display text-2xl font-bold text-gold tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={phase === "logo" ? { opacity: 1, y: 0 } : phase === "flip" ? { opacity: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              OIL STRATEGY
            </motion.span>
            <motion.span
              className="font-mono text-[10px] text-gold-muted tracking-[0.4em] mt-1"
              initial={{ opacity: 0 }}
              animate={phase === "logo" ? { opacity: 1 } : phase === "flip" ? { opacity: 0 } : {}}
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
