import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, ArrowLeft, Sparkles, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ScanScreen = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "No image", description: "Please upload a receipt first", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const { receiptId } = await api.uploadReceipt(file);
      const result = await api.analyzeReceipt(receiptId);
      navigate("/result", { state: { result } });
    } catch {
      toast({ title: "Error", description: "Failed to analyze receipt", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mobile-container px-6 py-8 bg-background">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("/home")} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Scan Receipt</h1>
      </div>

      <input ref={fileInput} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

      {!preview ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <button
            onClick={() => fileInput.current?.click()}
            className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/50 flex flex-col items-center justify-center gap-4 hover:border-primary/60 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Tap to capture or upload</p>
              <p className="text-sm text-muted-foreground mt-1">JPG, PNG supported</p>
            </div>
          </button>

          <div className="flex gap-3">
            <Button onClick={() => { fileInput.current?.removeAttribute("capture"); fileInput.current?.click(); }} variant="outline" className="flex-1 h-12 rounded-xl">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
            <Button onClick={() => { fileInput.current?.setAttribute("capture", "environment"); fileInput.current?.click(); }} variant="outline" className="flex-1 h-12 rounded-xl">
              <Camera className="w-4 h-4 mr-2" /> Camera
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img src={preview} alt="Receipt preview" className="w-full object-contain max-h-[60vh]" />
            <button
              onClick={() => { setPreview(null); setFile(null); }}
              className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card transition-colors"
            >
              <Image className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full h-14 text-lg font-semibold rounded-xl eco-gradient eco-shadow text-primary-foreground"
          >
            {analyzing ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </div>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2" /> Analyze Receipt</>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ScanScreen;
