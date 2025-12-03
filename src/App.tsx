// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Screener from "./pages/Screener";
import StockDetail from "./pages/StockDetail";
import Comparison from "./pages/Comparison";
import Auth from "./pages/Auth";
import Watchlist from "./pages/Watchlist";
import NotFound from "./pages/NotFound";
import Portfolio from "./pages/Portfolio";
import Screens from "./pages/Screens";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/screener" element={<Screener />} />
              <Route path="/screens" element={<Screens />} /> 
              <Route path="/stock/:symbol" element={<StockDetail />} />
              <Route path="/compare" element={<Comparison />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Reset Password Route */}
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route 
                path="/portfolio" 
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/watchlist" 
                element={
                  <ProtectedRoute>
                    <Watchlist />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 - Keep this last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
