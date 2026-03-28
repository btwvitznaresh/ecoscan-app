import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Leaf } from "lucide-react";
import { api, type SwapItem } from "@/services/api";
import { motion } from "framer-motion";

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
      api.getSwaps(state.scanId).then((data) => { setSwaps(data); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [state]);

  return (
    <div className="mobile-container px-6 py-8 bg-background">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Eco Swaps</h1>
      </div>

      <p className="text-muted-foreground mb-6">Replace high-carbon items with greener alternatives 🌿</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : swaps.length === 0 ? (
        <div className="text-center py-20">
          <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No swap suggestions yet. Scan a receipt first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {swaps.map((swap, i) => (
            <motion.div key={swap.original} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Instead of</p>
                  <p className="font-semibold text-foreground">{swap.original}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Try</p>
                  <p className="font-semibold text-primary">{swap.swap}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Save {swap.saveCO2}kg CO₂</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SwapScreen;
