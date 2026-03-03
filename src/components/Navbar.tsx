import { useState, useEffect } from "react";
import { Flame, Wallet, Clock } from "lucide-react";

const Navbar = () => {
  const [countdown, setCountdown] = useState(1800); // 30 min

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 1800 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(countdown / 60).toString().padStart(2, "0");
  const seconds = (countdown % 60).toString().padStart(2, "0");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-gold" />
          <span className="font-display text-xl tracking-widest text-foreground">
            WTI / <span className="text-gold">USOR</span>
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 border border-border rounded bg-secondary font-mono text-sm">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground text-xs tracking-wider uppercase">Next Drop</span>
          <span className="text-gold font-semibold tracking-wider">
            {minutes}:{seconds}
          </span>
        </div>

        <button className="flex items-center gap-2 px-5 py-2 gradient-gold rounded text-sm font-semibold tracking-wider uppercase text-primary-foreground hover:opacity-90 transition-opacity">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
