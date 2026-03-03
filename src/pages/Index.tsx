import { useState, useCallback } from "react";
import oilLogo from "@/assets/oil-logo.png";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Operations from "@/components/Operations";
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

        <Operations />

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
              <img src={oilLogo} alt="SOR" className="w-7 h-7 object-contain" />
              <span className="font-display text-sm font-semibold text-gold">
                STRATEGIC OIL RESERVE
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
