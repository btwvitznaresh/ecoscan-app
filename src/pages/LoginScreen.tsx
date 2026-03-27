import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.login(email, password);
      navigate("/home");
    } catch {
      toast({ title: "Login Failed", description: "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container flex flex-col items-center justify-center px-8 py-12 bg-background">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-20 h-20 rounded-full eco-gradient flex items-center justify-center mb-6 eco-shadow-lg"
      >
        <Leaf className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-extrabold eco-gradient-text mb-2"
      >
        EcoScan
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground text-center mb-10"
      >
        Track your carbon footprint from grocery receipts 🌍
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full space-y-4"
      >
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 h-14 text-base rounded-xl bg-card border-border"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 h-14 text-base rounded-xl bg-card border-border"
          />
        </div>

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-14 text-lg font-semibold rounded-xl eco-gradient eco-shadow text-primary-foreground"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" /> Sign In
            </>
          )}
        </Button>

        <p className="text-center text-muted-foreground pt-4">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-primary font-semibold hover:underline">
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
