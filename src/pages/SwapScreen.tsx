import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Leaf } from "lucide-react";
import { api, type SwapItem } from "@/services/api";
import { motion } from "framer-motion";

const gradeColors: Record<string, string> = {
  A: "bg-grade-a", B: "bg-grade-b", C: "bg-grade-c", D: "bg-grade-d", F: "bg-grade-f",
};

const gradeTextColors: Record<string, string> = {
  A: "text-white", B: "text-white", C: "text-slate-950 font-bold", D: "text-slate-950 font-bold", F: "text-white",
};

const estimateGrade = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("beef") || n.includes("steak") || n.includes("lamb") || n.includes("red meat")) return "F";
  if (n.includes("cheese") || n.includes("butter") || n.includes("pork") || n.includes("bacon") || n.includes("sausage")) return "D";
  if (n.includes("chicken") || n.includes("poultry") || n.includes("turkey") || n.includes("fish") || n.includes("salmon") || n.includes("seafood") || n.includes("rice") || n.includes("egg")) return "C";
  if (n.includes("milk") || n.includes("dairy") || n.includes("yogurt") || n.includes("bread") || n.includes("pasta") || n.includes("wheat")) return "B";
  return "A";
};

const SwapScreen = () => {
  const [swaps, setSwaps] = useState<SwapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { scanId?: string; swaps?: SwapItem[] } | null;

  useEffect(() => {
    if (state?.swaps) {
      setSwaps(state.swaps);
      setLoading(false);
    } else if (state?.scanId) {
      api.getSwaps(state.scanId).then((data) => { setSwaps(data); setLoading(false); }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [state]);

  return (
    <div className="mobile-container px-6 py-8 bg-background flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors focus:ring-2 focus:ring-primary focus:outline-none" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Eco Swaps</h1>
        </div>

        <p className="text-xs text-muted-foreground mb-6 px-1">Replace high-carbon items with greener alternatives to minimize your impact 🌿</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : swaps.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border p-6">
            <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No swap suggestions found. Scan a receipt with high-impact items first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {swaps.map((swap, i) => {
              const origGrade = estimateGrade(swap.original);
              const swapGrade = estimateGrade(swap.swap);

              return (
                <motion.div 
                  key={swap.original} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.08 }} 
                  className="bg-card rounded-2xl border border-border p-4 eco-shadow"
                >
                  <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
                    
                    {/* Original Item Card */}
                    <div className="bg-muted/20 border border-border/40 rounded-xl p-3 flex flex-col items-center text-center justify-between min-w-0">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Original</p>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-extrabold mb-2 flex-shrink-0 ${gradeColors[origGrade]} ${gradeTextColors[origGrade]}`}>
                        {origGrade}
                      </div>
                      <p className="font-semibold text-[11px] text-foreground line-clamp-2 leading-tight">
                        {swap.original}
                      </p>
                    </div>

                    {/* Improvement Delta Badge */}
                    <div className="flex flex-col items-center justify-center gap-1.5 flex-shrink-0 px-1">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[9px] font-extrabold text-primary px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 whitespace-nowrap">
                        {origGrade} → {swapGrade}
                      </span>
                    </div>

                    {/* Suggested Swap Card */}
                    <div className="bg-grade-a/5 border border-grade-a/25 rounded-xl p-3 flex flex-col items-center text-center justify-between min-w-0">
                      <p className="text-[9px] uppercase font-bold text-primary tracking-wider mb-2">Eco Swap</p>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-extrabold mb-2 flex-shrink-0 ${gradeColors[swapGrade]} ${gradeTextColors[swapGrade]}`}>
                        {swapGrade}
                      </div>
                      <p className="font-bold text-[11px] text-primary line-clamp-2 leading-tight">
                        {swap.swap}
                      </p>
                    </div>

                  </div>

                  {/* Savings Footnote Card footer */}
                  <div className="mt-3 pt-3 border-t border-border/55 flex items-center justify-center gap-2">
                    <Leaf className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-bold text-primary">
                      Saves {swap.saveCO2} kg CO₂e
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapScreen;
