import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Leaf } from "lucide-react";
import { api, type HistoryItem } from "@/services/api";
import { motion } from "framer-motion";

const gradeColors: Record<string, string> = {
  A: "bg-grade-a",
  B: "bg-grade-b",
  C: "bg-grade-c",
  D: "bg-grade-d",
  F: "bg-grade-f",
};

const HistoryScreen = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = () => {
    setLoading(true);
    api.getHistory().then((data) => { setHistory(data); setLoading(false); });
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="mobile-container px-6 py-8 bg-background">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("/home")} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20">
          <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No scans yet. Start by scanning a receipt!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
            >
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-primary-foreground flex-shrink-0 ${gradeColors[item.grade]}`}>
                {item.grade}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{item.co2}kg CO₂</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  <span className="text-muted-foreground">· {item.items} items</span>
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
