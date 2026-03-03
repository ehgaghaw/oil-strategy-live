import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import ClaimRewards from "@/components/ClaimRewards";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <Dashboard />
      <ClaimRewards />
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
          Oil Strategy Terminal — Real-Time Reserve Analytics
        </p>
      </footer>
    </div>
  );
};

export default Index;
