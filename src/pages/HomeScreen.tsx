import { useNavigate } from "react-router-dom";
import { Camera, History, Leaf, LogOut, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { motion } from "framer-motion";

const HomeScreen = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate("/");
  };

  const cards = [
    {
      icon: Camera,
      title: "Scan Receipt",
      desc: "Upload or capture a grocery receipt",
      action: () => navigate("/scan"),
      gradient: true,
    },
    {
      icon: History,
      title: "View History",
      desc: "See your past carbon footprint scans",
      action: () => navigate("/history"),
      gradient: false,
    },
    {
      icon: TrendingDown,
      title: "Eco Swaps",
      desc: "Discover greener alternatives",
      action: () => navigate("/swaps"),
      gradient: false,
    },
  ];

  return (
    <div className="mobile-container px-6 py-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground text-sm">
            Welcome back 👋
          </motion.p>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-foreground">
            EcoScan Dashboard
          </motion.h1>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Eco tip card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="eco-gradient rounded-2xl p-5 mb-8 eco-shadow-lg"
      >
        <div className="flex items-start gap-3">
          <Leaf className="w-6 h-6 text-primary-foreground mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-primary-foreground text-lg">Eco Tip of the Day</h3>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Switching from beef to plant-based protein just once a week can save up to 600kg of CO₂ per year! 🌿
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action cards */}
      <div className="space-y-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            onClick={card.action}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all active:scale-[0.98] ${
              card.gradient
                ? "eco-gradient eco-shadow text-primary-foreground"
                : "bg-card border border-border hover:border-primary/30 hover:eco-shadow"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              card.gradient ? "bg-primary-foreground/20" : "bg-secondary"
            }`}>
              <card.icon className={`w-6 h-6 ${card.gradient ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${card.gradient ? "" : "text-foreground"}`}>{card.title}</h3>
              <p className={`text-sm ${card.gradient ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{card.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
