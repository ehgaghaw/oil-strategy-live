import { Fuel } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import ClaimRewards from "@/components/ClaimRewards";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* Divider */}
      <div className="container px-6">
        <div className="h-px bg-border" />
      </div>

      <Dashboard />

      <div className="container px-6">
        <div className="h-px bg-border" />
      </div>

      <ClaimRewards />

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-flame flex items-center justify-center">
              <Fuel className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">
              OIL STRATEGY
            </span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground tracking-[0.2em]">
            REAL-TIME RESERVE ANALYTICS — SOLANA MAINNET
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
