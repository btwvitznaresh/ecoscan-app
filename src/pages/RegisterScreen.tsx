import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async () => {
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast({ title: "Success! 🎉", description: "Check your email to confirm your account." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container flex flex-col items-center justify-center px-8 py-12 bg-background">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 rounded-full eco-gradient flex items-center justify-center mb-6 eco-shadow-lg"
      >
        <Leaf className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-extrabold eco-gradient-text mb-2">
        Create Account
      </motion.h1>
      <p className="text-muted-foreground text-center mb-10">Join the eco-conscious community 🌱</p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-14 text-base rounded-xl bg-card" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 h-14 text-base rounded-xl bg-card" />
        </div>

        <Button onClick={handleRegister} disabled={loading} className="w-full h-14 text-lg font-semibold rounded-xl eco-gradient eco-shadow text-primary-foreground">
          {loading ? <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <><UserPlus className="w-5 h-5 mr-2" /> Sign Up</>}
        </Button>

        <p className="text-center text-muted-foreground pt-4">
          Already have an account?{" "}
          <button onClick={() => navigate("/")} className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm px-0.5">Sign In</button>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterScreen;
