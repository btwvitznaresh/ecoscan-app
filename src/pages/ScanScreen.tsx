import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, ArrowLeft, Sparkles, Image, CameraOff, WifiOff, FileX, AlertTriangle, RefreshCw, Receipt, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type ErrorType = "camera" | "not_found" | "network" | "unknown";
type ScanMode = "receipt" | "product";

const ScanScreen = () => {
  const [mode, setMode] = useState<ScanMode>("receipt");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setErrorType(null);
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleCameraClick = async () => {
    setErrorType(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
      }
      fileInput.current?.setAttribute("capture", "environment");
      fileInput.current?.click();
    } catch (err: any) {
      console.warn("Camera access denied or unavailable", err);
      setErrorType("camera");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "No image", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    setErrorType(null);
    try {
      // Use user.id if logged in, otherwise default to 'guest' 
      // (AuthContext background login should populate user.id shortly after load)
      const userId = user?.id || 'guest';
      const { receiptPath } = await api.uploadReceipt(file, userId);
      
      // The edge function expects an image; we pass it regardless of mode.
      // Gemini Vision is flexible enough to extract product information from a single item image.
      const result = await api.analyzeReceipt(receiptPath);
      
      if (!result || !result.items || result.items.length === 0) {
        setErrorType("not_found");
        return;
      }
      
      navigate("/result", { state: { result } });
    } catch (err: any) {
      console.error("Receipt analysis failed:", err);
      const isNetwork = 
        !navigator.onLine || 
        err.message?.toLowerCase().includes("network") || 
        err.message?.toLowerCase().includes("fetch") || 
        err.status === 0;

      if (isNetwork) {
        setErrorType("network");
      } else {
        setErrorType("unknown");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const getErrorConfig = (type: ErrorType) => {
    const configs: Record<ErrorType, { title: string; message: string; icon: React.ComponentType<any>; actionText: string; onAction: () => void }> = {
      camera: {
        title: "Camera Access Required",
        message: "We need camera permission to scan directly. Please enable permissions in your system settings, or upload an image file instead.",
        icon: CameraOff,
        actionText: "Upload Image File",
        onAction: () => {
          setErrorType(null);
          fileInput.current?.removeAttribute("capture");
          fileInput.current?.click();
        }
      },
      not_found: {
        title: "No Items Recognized",
        message: `We couldn't detect any ${mode === "receipt" ? "receipt text" : "products"} in this image. Please try again with a clearer photo.`,
        icon: FileX,
        actionText: "Choose Another Photo",
        onAction: () => {
          setErrorType(null);
          setPreview(null);
          setFile(null);
        }
      },
      network: {
        title: "Network Connection Issue",
        message: "Unable to reach the server. Please check your internet connection and try again.",
        icon: WifiOff,
        actionText: "Retry Analysis",
        onAction: () => {
          handleAnalyze();
        }
      },
      unknown: {
        title: "Analysis Failed",
        message: "An unexpected error occurred during processing. Please verify the image quality and try again.",
        icon: AlertTriangle,
        actionText: "Back to Scan",
        onAction: () => {
          setErrorType(null);
          setPreview(null);
          setFile(null);
        }
      }
    };
    return configs[type];
  };

  if (analyzing) {
    return (
      <div className="mobile-container px-6 py-8 bg-background flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-l-accent"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-foreground">
            Analyzing {mode === "receipt" ? "Receipt" : "Product"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 px-4">
            Our AI model is extracting product names and calculating their carbon footprint...
          </p>

          <div className="flex gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                className="w-2.5 h-2.5 rounded-full bg-primary"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (errorType) {
    const errorConfig = getErrorConfig(errorType);
    const ErrorIcon = errorConfig.icon;

    return (
      <div className="mobile-container px-6 py-8 bg-background flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-1 text-center max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="bg-card rounded-2xl border border-border p-6 eco-shadow flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <ErrorIcon className="w-7 h-7" />
            </div>
            
            <h2 className="text-lg font-bold text-foreground">{errorConfig.title}</h2>
            <p className="text-xs text-muted-foreground mt-2 px-2 leading-relaxed">
              {errorConfig.message}
            </p>
          </motion.div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={errorConfig.onAction}
            className="w-full h-12 rounded-xl eco-gradient eco-shadow text-primary-foreground font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {errorConfig.actionText}
          </Button>
          
          <Button 
            onClick={() => {
              setErrorType(null);
              setPreview(null);
              setFile(null);
            }} 
            variant="outline" 
            className="w-full h-12 rounded-xl focus:ring-2 focus:ring-border focus:outline-none"
          >
            Cancel & Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container px-6 py-8 bg-background flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/home")} className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Scan Image</h1>
        </div>

        {/* Mode Toggle */}
        {!preview && (
          <div className="flex p-1 bg-muted/50 rounded-xl mb-6">
            <button
              onClick={() => setMode("receipt")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "receipt" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Receipt className="w-4 h-4" /> Receipt
            </button>
            <button
              onClick={() => setMode("product")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "product" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-4 h-4" /> Single Product
            </button>
          </div>
        )}

        <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        {!preview ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <button
              onClick={handleCameraClick}
              className="w-full aspect-[4/5] rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/30 flex flex-col items-center justify-center gap-4 hover:border-primary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="font-semibold text-foreground">
                  Tap to scan {mode === "receipt" ? "grocery receipt" : "a single product"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Camera will open to snap a picture</p>
              </div>
            </button>

            <div className="flex gap-3">
              <Button 
                onClick={() => { fileInput.current?.removeAttribute("capture"); fileInput.current?.click(); }} 
                variant="outline" 
                className="flex-1 h-12 rounded-xl focus:ring-2 focus:ring-border focus:outline-none"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload File
              </Button>
              <Button 
                onClick={handleCameraClick} 
                variant="outline" 
                className="flex-1 h-12 rounded-xl focus:ring-2 focus:ring-border focus:outline-none"
              >
                <Camera className="w-4 h-4 mr-2" /> Use Camera
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
              <img src={preview} alt="Preview" className="w-full object-contain max-h-[50vh]" />
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full p-2 hover:bg-card transition-colors border border-border"
                aria-label="Remove image"
              >
                <Image className="w-4 h-4 text-foreground" />
              </button>
            </div>

            <Button
              onClick={handleAnalyze}
              className="w-full h-14 text-lg font-semibold rounded-xl eco-gradient eco-shadow text-primary-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <Sparkles className="w-5 h-5 mr-2" /> Analyze {mode === "receipt" ? "Receipt" : "Product"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScanScreen;
