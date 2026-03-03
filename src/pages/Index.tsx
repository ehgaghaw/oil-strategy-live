import { useState, useCallback } from "react";
import { Droplets } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import ClaimRewards from "@/components/ClaimRewards";
import OilSplashIntro from "@/components/OilSplashIntro";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {!introComplete && <OilSplashIntro onComplete={handleIntroComplete} />}

      <div
        style={{
          opacity: introComplete ? 1 : 0,
          transition: "opacity 0.6s ease-out",
        }}
      >
        <Navbar />
        <HeroSection />

        <div className="container px-6">
          <div className="h-px bg-gold-muted" />
        </div>

        <Dashboard />

        <div className="container px-6">
          <div className="h-px bg-gold-muted" />
        </div>

        <ClaimRewards />

        <footer className="border-t border-gold-muted py-10">
          <div className="container px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 gradient-gold flex items-center justify-center">
                <Droplets className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-display text-sm font-semibold text-gold">
                OIL STRATEGY
              </span>
            </div>
            <p className="font-mono text-[10px] text-gold-muted tracking-[0.2em]">
              REAL-TIME RESERVE ANALYTICS — SOLANA MAINNET
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
