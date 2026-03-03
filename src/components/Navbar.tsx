import { useState, useEffect } from "react";
import { Wallet, Timer } from "lucide-react";
import oilLogo from "@/assets/oil-logo.png";

const EPOCH_MS = 15 * 60 * 1000;
const DISTRIBUTING_MS = 10_000;

const Navbar = () => {
  const [remaining, setRemaining] = useState(() => EPOCH_MS - (Date.now() % EPOCH_MS));
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    const tick = () => {
      const r = EPOCH_MS - (Date.now() % EPOCH_MS);
      if (r <= 1000 && !distributing) {
        setDistributing(true);
        setTimeout(() => setDistributing(false), DISTRIBUTING_MS);
      }
      setRemaining(r);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [distributing]);

  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gold-muted">
      <div className="container flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <img src={oilLogo} alt="SOR" className="w-9 h-9 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-tight text-gold">
              SOR / SOL
            </span>
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
              STRATEGIC OIL RESERVE
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 px-5 py-2 bg-oil-light border border-gold-muted">
          <Timer className="w-3.5 h-3.5 text-gold" />
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[10px] text-gold-muted tracking-widest">
              {distributing ? "STATUS" : "NEXT DROP"}
            </span>
            <span className={`font-mono text-lg font-bold tracking-widest ${distributing ? "text-gold animate-pulse" : "text-gold"}`}>
              {distributing ? "DISTRIBUTING..." : <>{minutes}<span className="animate-flicker">:</span>{seconds}</>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/ehgaghaw/oil-strategy-live"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center border border-gold-muted text-gold-muted hover:text-gold hover:border-gold transition-colors"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
          <a
            href="https://x.com/SORonSolana"
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
