import { useNavigate } from "react-router-dom";
import { Camera, History, Leaf, TrendingDown, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const gradeColors: Record<string, string> = {
  A: "bg-grade-a", B: "bg-grade-b", C: "bg-grade-c", D: "bg-grade-d", F: "bg-grade-f",
};

const gradeTextColors: Record<string, string> = {
  A: "text-white", B: "text-white", C: "text-slate-950 font-bold", D: "text-slate-950 font-bold", F: "text-white",
};

const HomeScreen = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<{
    lastScan: { name: string; grade: string } | null;
    scansThisMonth: number;
  } | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    api.getDashboardData()
      .then((data) => {
        setDashboardData(data);
        setDbLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        setDbLoading(false);
      });
  }, []);

  const displayName = "Guest";

  const cards = [
    { icon: Camera, title: "Scan Receipt", desc: "Upload or capture a grocery receipt", action: () => navigate("/scan"), gradient: true },
    { icon: History, title: "View History", desc: "See your past carbon footprint scans", action: () => navigate("/history"), gradient: false },
    { icon: TrendingDown, title: "Eco Swaps", desc: "Discover greener alternatives", action: () => navigate("/swaps"), gradient: false },
  ];

  return (
    <div className="mobile-container px-6 py-8 bg-background flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground text-sm">
              Welcome back, {displayName} 👋
            </motion.p>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-foreground">
              EcoScan Dashboard
            </motion.h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Eco Tip of the Day */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="eco-gradient rounded-2xl p-4 mb-6 eco-shadow">
          <div className="flex items-start gap-3">
            <Leaf className="w-5 h-5 text-primary-foreground mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary-foreground text-sm">Eco Tip of the Day</h3>
              <p className="text-primary-foreground/90 text-xs mt-1 leading-relaxed">
                Switching from beef to plant-based protein just once a week can save up to 600kg of CO₂ per year! 🌿
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lightweight Secondary Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-4 mb-6"
        >
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3 px-1">Your Impact Summary</h3>

          {dbLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : !dashboardData || !dashboardData.lastScan ? (
            <div className="text-center py-3 px-2">
              <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-2">
                <Award className="w-4 h-4 text-primary animate-bounce" />
                Scan your first product to start tracking your impact
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              {/* Last Scanned Item Card */}
              <div className="flex items-center gap-3 bg-muted/20 border border-border/40 rounded-xl p-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${gradeColors[dashboardData.lastScan.grade]} ${gradeTextColors[dashboardData.lastScan.grade]}`}>
                  {dashboardData.lastScan.grade}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider leading-none">Last Item</p>
                  <p className="font-semibold text-xs text-foreground truncate mt-1">{dashboardData.lastScan.name}</p>
                </div>
              </div>

              {/* Monthly Scans Count Card */}
              <div className="flex items-center gap-3 bg-muted/20 border border-border/40 rounded-xl p-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider leading-none">This Month</p>
                  <p className="font-bold text-xs text-foreground mt-1">
                    {dashboardData.scansThisMonth} {dashboardData.scansThisMonth === 1 ? 'scan' : 'scans'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Primary CTA and Actions list */}
        <div className="space-y-4">
          {cards.map((card, i) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              onClick={card.action}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98] border focus:ring-2 focus:ring-primary focus:outline-none ${
                card.gradient 
                  ? "eco-gradient eco-shadow text-primary-foreground border-transparent hover:opacity-95" 
                  : "bg-card border-border hover:border-primary/30 hover:eco-shadow"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.gradient ? "bg-primary-foreground/20" : "bg-secondary"}`}>
                <card.icon className={`w-5 h-5 ${card.gradient ? "text-primary-foreground" : "text-primary"}`} />
              </div>
              <div>
                <h3 className={`font-semibold text-base ${card.gradient ? "" : "text-foreground"}`}>{card.title}</h3>
                <p className={`text-xs ${card.gradient ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{card.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
