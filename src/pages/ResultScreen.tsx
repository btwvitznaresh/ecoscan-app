import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, ArrowRight, Package, FlaskConical, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { ResultData, SwapItem } from "@/services/api";

type Factor = {
  name: string;
  status: "good" | "moderate" | "poor";
  label: string;
  desc: string;
  icon: React.ComponentType<any>;
};

const getGradeDetails = (grade: string) => {
  const normGrade = (grade || "C").toUpperCase();
  
  const factors: Record<string, Factor[]> = {
    A: [
      { name: "Carbon Footprint", status: "good", label: "Very Low", desc: "Minimal greenhouse gas emissions", icon: Leaf },
      { name: "Packaging", status: "good", label: "Eco-friendly", desc: "100% biodegradable or plastic-free", icon: Package },
      { name: "Ingredients", status: "good", label: "Sustainable", desc: "Organic, local, and minimally processed", icon: FlaskConical }
    ],
    B: [
      { name: "Carbon Footprint", status: "good", label: "Low Impact", desc: "Emissions significantly below average", icon: Leaf },
      { name: "Packaging", status: "moderate", label: "Recyclable", desc: "Mainly recyclable card or PET materials", icon: Package },
      { name: "Ingredients", status: "good", label: "Responsible", desc: "Sustainably sourced, non-toxic components", icon: FlaskConical }
    ],
    C: [
      { name: "Carbon Footprint", status: "moderate", label: "Average", desc: "Standard emissions profile for this type", icon: Leaf },
      { name: "Packaging", status: "moderate", label: "Mixed Materials", desc: "Packaging is only partially recyclable", icon: Package },
      { name: "Ingredients", status: "moderate", label: "Conventional", desc: "Standard farming/processing footprint", icon: FlaskConical }
    ],
    D: [
      { name: "Carbon Footprint", status: "poor", label: "High Impact", desc: "Significant emissions from production/shipping", icon: Leaf },
      { name: "Packaging", status: "poor", label: "Single-Use", desc: "Non-recyclable packaging heading to landfill", icon: Package },
      { name: "Ingredients", status: "moderate", label: "Standard", desc: "Conventional farming with chemical usage", icon: FlaskConical }
    ],
    F: [
      { name: "Carbon Footprint", status: "poor", label: "Very High", desc: "Extremely carbon-heavy manufacturing", icon: Leaf },
      { name: "Packaging", status: "poor", label: "Excessive Plastic", desc: "Hard-to-recycle multi-layered films", icon: Package },
      { name: "Ingredients", status: "poor", label: "High Resource Use", desc: "Resource-depleting or high-chemical farming", icon: FlaskConical }
    ]
  };

  const details: Record<string, { label: string; description: string; badgeBg: string; badgeText: string; ringColor: string }> = {
    A: {
      label: "A — Great choice",
      description: "Excellent environmental profile. Keep choosing products like this!",
      badgeBg: "bg-grade-a",
      badgeText: "text-white",
      ringColor: "ring-grade-a"
    },
    B: {
      label: "B — Good choice",
      description: "Solid eco-friendly option. Below-average carbon footprint.",
      badgeBg: "bg-grade-b",
      badgeText: "text-white",
      ringColor: "ring-grade-b"
    },
    C: {
      label: "C — Moderate impact",
      description: "Average environmental footprint. Check out eco-swaps for a better choice.",
      badgeBg: "bg-grade-c",
      badgeText: "text-slate-950 font-extrabold", // High-contrast dark text on yellow
      ringColor: "ring-grade-c"
    },
    D: {
      label: "D — High impact",
      description: "Above-average impact. We suggest looking for a green alternative.",
      badgeBg: "bg-grade-d",
      badgeText: "text-slate-950 font-extrabold", // High-contrast dark text on orange
      ringColor: "ring-grade-d"
    },
    F: {
      label: "F — Very high impact",
      description: "Severe environmental cost. Please consider swap suggestions immediately.",
      badgeBg: "bg-grade-f",
      badgeText: "text-white",
      ringColor: "ring-grade-f"
    }
  };

  return {
    factors: factors[normGrade] || factors.C,
    ...(details[normGrade] || details.C)
  };
};

const ResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { result: ResultData & { scanId: string; swaps: SwapItem[] } } | null;
  const result = state?.result;

  if (!result) {
    navigate("/home");
    return null;
  }

  const details = getGradeDetails(result.grade);
  const maxCO2 = Math.max(...result.items.map((i) => i.co2), 0.1);

  return (
    <div className="mobile-container px-6 py-8 bg-background flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/home")} className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Results</h1>
        </div>

        {/* Eco-Grade Central Badge Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6 text-center eco-shadow flex flex-col items-center justify-center"
        >
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">Eco-Grade</p>
          
          {/* Large bold badge with background/ring color using grade color tokens */}
          <div className={`relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-background shadow-md mb-4 ${details.badgeBg} ${details.badgeText}`}>
            <span className="text-5xl font-extrabold tracking-tight">
              {result.grade}
            </span>
            {/* Conditional ring pulse/static animation */}
            {result.grade === "C" && (
              <div className={`absolute -inset-2 rounded-full ring-4 ${details.ringColor} opacity-20`} />
            )}
            {(result.grade === "A" || result.grade === "B") && (
              <div className={`absolute -inset-2 rounded-full ring-4 ${details.ringColor} opacity-30 animate-pulse`} />
            )}
          </div>

          {/* Grade short label (Accessibility: letter + label) */}
          <h2 className="text-lg font-bold text-foreground mt-2">
            {details.label}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 px-4">
            {details.description}
          </p>

          <div className="mt-5 pt-4 border-t border-border w-full flex justify-between items-center px-2">
            <span className="text-xs text-muted-foreground">Total Carbon Footprint:</span>
            <span className="text-sm font-bold text-foreground">{result.totalCO2} kg CO₂e</span>
          </div>
        </motion.div>

        {/* Key Impact Factors Breakdown Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          className="bg-card rounded-2xl border border-border p-5 mb-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
            <Leaf className="w-4 h-4 text-primary" /> Key Impact Factors
          </h3>
          
          <div className="space-y-3">
            {details.factors.map((factor) => {
              const statusColors = {
                good: "bg-grade-a/10 text-grade-a border-grade-a/20",
                moderate: "bg-grade-c/10 text-grade-c border-grade-c/20",
                poor: "bg-grade-f/10 text-grade-f border-grade-f/20",
              };
              
              const StatusIcon = factor.status === "good" ? CheckCircle2 : factor.status === "moderate" ? AlertTriangle : AlertCircle;
              const FactorIcon = factor.icon;

              return (
                <div key={factor.name} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/40">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-background border border-border text-muted-foreground">
                    <FactorIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-xs text-foreground">{factor.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusColors[factor.status]}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {factor.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">{factor.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Item Breakdown Progress Bars */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }} 
          className="bg-card rounded-2xl border border-border p-5 mb-6"
        >
          <h3 className="font-semibold text-foreground mb-4 text-sm">Item Breakdown</h3>
          <div className="space-y-3">
            {result.items.map((item, i) => (
              <motion.div key={item.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{item.name}</span>
                  <span className="font-semibold text-foreground">{item.co2}kg</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.co2 / maxCO2) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                    className="h-full rounded-full eco-gradient"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex gap-3 mt-2">
        <Button 
          onClick={() => navigate("/swaps", { state: { scanId: result.scanId, swaps: result.swaps } })} 
          className="flex-1 h-12 rounded-xl eco-gradient eco-shadow text-primary-foreground focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <Leaf className="w-4 h-4 mr-2" /> View Swaps
        </Button>
        <Button 
          onClick={() => navigate("/home")} 
          variant="outline" 
          className="flex-1 h-12 rounded-xl focus:ring-2 focus:ring-border focus:outline-none"
        >
          Home <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;
