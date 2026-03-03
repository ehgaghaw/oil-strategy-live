import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import oilLogo from "@/assets/oil-logo.png";

const OilSplashIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"logo" | "leak" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("leak"), 1400);
    const t2 = setTimeout(() => setPhase("done"), 4000);
    const t3 = setTimeout(onComplete, 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "hsl(0 0% 3%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Oil leak streams coming from behind the logo */}
          <motion.div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={phase === "leak" ? { opacity: 1 } : {}}
          >
            {/* Central thick oil stream from logo position */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: "50%",
                width: "120px",
                background: "linear-gradient(180deg, hsl(30 20% 5%) 0%, hsl(35 40% 14% / 0.9) 30%, hsl(40 30% 8% / 0.5) 60%, transparent 100%)",
                borderRadius: "0 0 60% 60%",
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={phase === "leak" ? { height: "55vh", opacity: 1 } : {}}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Side oil drips leaking from the logo */}
            {[
              { left: "calc(50% - 80px)", delay: 0.15, width: 14 },
              { left: "calc(50% - 45px)", delay: 0.05, width: 20 },
              { left: "calc(50% - 10px)", delay: 0, width: 30 },
              { left: "calc(50% + 20px)", delay: 0.08, width: 18 },
              { left: "calc(50% + 55px)", delay: 0.12, width: 12 },
            ].map((drip, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: "55%",
                  left: drip.left,
                  width: `${drip.width}px`,
                  background: "linear-gradient(180deg, hsl(30 20% 5%), hsl(35 40% 14% / 0.7), hsl(43 72% 52% / 0.06), transparent)",
                  borderRadius: "0 0 50% 50%",
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={phase === "leak" ? { height: "50vh", opacity: [0, 0.8, 0.4] } : {}}
                transition={{
                  duration: 1.2 + i * 0.12,
                  delay: drip.delay + 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}

            {/* Wide oil spread at bottom */}
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              style={{
                background: "linear-gradient(0deg, hsl(30 20% 5%) 0%, hsl(35 40% 14% / 0.4) 40%, transparent 100%)",
              }}
              initial={{ height: 0 }}
              animate={phase === "leak" ? { height: "30vh" } : {}}
              transition={{ duration: 1.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Gold shimmer traveling down */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-40 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(43 72% 52% / 0.6), transparent)",
              }}
              initial={{ top: "50%", opacity: 0 }}
              animate={phase === "leak" ? { top: "100%", opacity: [0, 1, 0] } : {}}
              transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
            />
          </motion.div>

          {/* Logo - stays in place, oil leaks from below it */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={
              phase === "logo"
                ? { scale: 1, opacity: 1 }
                : { scale: 0.9, opacity: 0, transition: { delay: 1.2, duration: 0.6 } }
            }
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.img
              src={oilLogo}
              alt="Oil Strategy"
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
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

            {/* Text that "forms" from the oil */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={phase === "leak" ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.span
                className="font-display text-3xl sm:text-4xl font-bold text-gold tracking-wider block"
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={phase === "leak" ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                OIL STRATEGY
              </motion.span>
              <motion.span
                className="font-mono text-xs text-gold-muted tracking-[0.5em] block mt-2"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={phase === "leak" ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                TERMINAL
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OilSplashIntro;
