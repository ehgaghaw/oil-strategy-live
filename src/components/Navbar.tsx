import { useState, useEffect } from "react";
import { Droplets, Wallet, Timer } from "lucide-react";

const Navbar = () => {
  const [countdown, setCountdown] = useState(1800);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 1800 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(countdown / 60).toString().padStart(2, "0");
  const seconds = (countdown % 60).toString().padStart(2, "0");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gold-muted">
      <div className="container flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-gold flex items-center justify-center">
            <Droplets className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-tight text-gold">
              WTI / USOR
            </span>
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
              OIL STRATEGY
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 px-5 py-2 bg-oil-light border border-gold-muted">
          <Timer className="w-3.5 h-3.5 text-gold" />
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[10px] text-gold-muted tracking-widest">
              NEXT DROP
            </span>
            <span className="font-mono text-lg font-bold text-gold tracking-widest">
              {minutes}<span className="animate-flicker">:</span>{seconds}
            </span>
          </div>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 gradient-gold text-primary-foreground font-display text-sm font-semibold tracking-wide hover:brightness-110 transition-all active:scale-[0.98]">
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">CONNECT WALLET</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
