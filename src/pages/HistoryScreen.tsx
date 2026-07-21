import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Leaf } from "lucide-react";
import { api, type HistoryItem } from "@/services/api";
import { motion } from "framer-motion";

const gradeColors: Record<string, string> = {
  A: "bg-grade-a", B: "bg-grade-b", C: "bg-grade-c", D: "bg-grade-d", F: "bg-grade-f",
};

// WCAG-safe text colours: dark text on yellow (C) and orange (D)
const gradeTextColors: Record<string, string> = {
  A: "text-white", B: "text-white", C: "text-slate-950 font-extrabold", D: "text-slate-950 font-extrabold", F: "text-white",
};

const gradeLabels: Record<string, string> = {
  A: "A — Great", B: "B — Good", C: "C — Moderate", D: "D — High impact", F: "F — Very high",
};

const HistoryScreen = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getHistory()
      .then((data) => { setHistory(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mobile-container px-6 py-8 bg-background">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/home")}
          className="p-2 rounded-xl hover:bg-muted transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
          aria-label="Go back to home"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20" aria-label="Loading history" role="status">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border p-6">
          <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">No scans yet. Start by scanning a receipt!</p>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Scan history">
          {history.map((item, i) => (
            <motion.div
              key={item.id}
              role="listitem"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-primary"
            >
              {/* Grade badge: letter + aria-label so it's never colour-only */}
              <span
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${gradeColors[item.grade]} ${gradeTextColors[item.grade]}`}
                aria-label={gradeLabels[item.grade] || `Grade ${item.grade}`}
                title={gradeLabels[item.grade] || `Grade ${item.grade}`}
              >
                {item.grade}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{item.co2} kg CO₂e</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <time dateTime={item.date}>{new Date(item.date).toLocaleDateString()}</time>
                  <span aria-hidden="true">·</span>
                  <span>{item.items} {item.items === 1 ? "item" : "items"}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
