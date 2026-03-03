import { motion } from "framer-motion";
import { Fuel, ArrowDownToLine, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Fuel,
    title: "FEES HARVESTED",
    body: "Every buy and sell of $SOR generates creator fees. They flow automatically into the Strategic Reserve treasury — no manual intervention.",
  },
  {
    number: "02",
    icon: ArrowDownToLine,
    title: "TREASURY BUYS BACK $SOR",
    body: "Treasury SOL is used to buy $SOR directly from the market via Jupiter. Constant buy pressure. Fully on-chain and verifiable.",
  },
  {
    number: "03",
    icon: Users,
    title: "OPERATORS GET PAID",
    body: "Every 15 minutes, bought $SOR is redistributed proportionally to all holders based on their position size. Connect your wallet and claim your reserves anytime.",
  },
];

const Operations = () => {
  return (
    <section className="container px-6 py-24">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <span className="font-mono text-[10px] text-gold tracking-[0.3em] uppercase block mb-2">
          // HOW IT WORKS
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Operations Protocol
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-border">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative bg-oil-light p-8 group hover:bg-oil-sheen/50 transition-colors"
          >
            {/* Step number */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 border border-gold-muted flex items-center justify-center group-hover:border-gold transition-colors">
                <step.icon className="w-5 h-5 text-gold-muted group-hover:text-gold transition-colors" />
              </div>
              <span className="font-mono text-[10px] text-gold-muted tracking-[0.3em]">
                STEP {step.number}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-display text-lg font-bold tracking-tight mb-3 group-hover:text-gold transition-colors">
              {step.title}
            </h3>

            {/* Body */}
            <p className="font-display text-sm text-muted-foreground leading-relaxed font-light">
              {step.body}
            </p>

            {/* Connector line (not on last) */}
            {i < 2 && (
              <div className="hidden md:block absolute top-1/2 -right-px w-px h-8 -translate-y-1/2 bg-gold-muted" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Operations;
