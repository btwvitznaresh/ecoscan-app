import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import HomeScreen from "./pages/HomeScreen";
import ScanScreen from "./pages/ScanScreen";
import ResultScreen from "./pages/ResultScreen";
import SwapScreen from "./pages/SwapScreen";
import HistoryScreen from "./pages/HistoryScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/scan" element={<ScanScreen />} />
            <Route path="/result" element={<ResultScreen />} />
            <Route path="/swaps" element={<SwapScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
