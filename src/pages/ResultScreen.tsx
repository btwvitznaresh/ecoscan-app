import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { ResultData } from "@/services/api";

const gradeColors: Record<string, string> = {
  A: "bg-grade-a",
  B: "bg-grade-b",
  C: "bg-grade-c",
  D: "bg-grade-d",
  F: "bg-grade-f",
};

const gradeTextColors: Record<string, string> = {
  A: "text-grade-a",
  B: "text-grade-b",
  C: "text-grade-c",
  D: "text-grade-d",
  F: "text-grade-f",
};

const ResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { result: ResultData })?.result;

  if (!result) {
    navigate("/home");
    return null;
  }

  const maxCO2 = Math.max(...result.items.map((i) => i.co2));

  return (
    <div className="mobile-container px-6 py-8 bg-background">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/home")} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Results</h1>
      </div>

      {/* Hero stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 mb-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Total Carbon Footprint</p>
        <p className="text-5xl font-extrabold text-foreground">{result.totalCO2}<span className="text-xl text-muted-foreground ml-1">kg</span></p>
        <p className="text-muted-foreground text-sm mt-1">CO₂ equivalent</p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <span className={`inline-flex items-center justify-center w-14 h-14 rounded-xl text-2xl font-extrabold text-primary-foreground ${gradeColors[result.grade]}`}>
            {result.grade}
          </span>
          <span className={`text-sm font-medium ${gradeTextColors[result.grade]}`}>
            {result.grade === "A" ? "Excellent!" : result.grade === "B" ? "Good job!" : result.grade === "C" ? "Average" : "Room for improvement"}
          </span>
        </div>
      </motion.div>

      {/* Item breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Item Breakdown</h3>
        <div className="space-y-3">
          {result.items.map((item, i) => (
            <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">{item.name}</span>
                <span className="font-semibold text-foreground">{item.co2}kg</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
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

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => navigate("/swaps")} className="flex-1 h-12 rounded-xl eco-gradient eco-shadow text-primary-foreground">
          <Leaf className="w-4 h-4 mr-2" /> View Swaps
        </Button>
        <Button onClick={() => navigate("/home")} variant="outline" className="flex-1 h-12 rounded-xl">
          Home <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;
