import { useState, useEffect } from "react";
import { Wallet, Timer } from "lucide-react";
import oilLogo from "@/assets/oil-logo.png";

const Navbar = () => {
  const [countdown, setCountdown] = useState(900); // 15 min

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 900 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(countdown / 60).toString().padStart(2, "0");
  const seconds = (countdown % 60).toString().padStart(2, "0");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gold-muted">
      <div className="container flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <img src={oilLogo} alt="WTI" className="w-9 h-9 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-tight text-gold">
              SOR / USOR
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

        <div className="flex items-center gap-3">
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center border border-gold-muted text-gold-muted hover:text-gold hover:border-gold transition-colors"
            aria-label="X (Twitter)"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <button className="flex items-center gap-2 px-5 py-2.5 gradient-gold text-primary-foreground font-display text-sm font-semibold tracking-wide hover:brightness-110 transition-all active:scale-[0.98]">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">CONNECT WALLET</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
