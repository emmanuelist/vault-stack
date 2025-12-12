import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VaultProvider } from "@/contexts/VaultContext";
import HomePage from "./pages/HomePage";
import MyVaultsPage from "./pages/MyVaultsPage";
import CreateVaultPage from "./pages/CreateVaultPage";
import VaultDetailPage from "./pages/VaultDetailPage";
import ActivityPage from "./pages/ActivityPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VaultProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vaults" element={<MyVaultsPage />} />
            <Route path="/create" element={<CreateVaultPage />} />
            <Route path="/vault/:id" element={<VaultDetailPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </VaultProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
