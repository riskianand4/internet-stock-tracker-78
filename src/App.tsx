import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { ScrollRestoration } from "./components/ScrollRestoration";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "./pages/Index";
import StatsPage from "./pages/StatsPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import AssetsPage from "./pages/AssetsPage";
import MorePage from "./pages/MorePage";
import OrdersPage from "./pages/OrdersPage";
import AlertsPage from "./pages/AlertsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import DatabasePage from "./pages/DatabasePage";
import SecurityPage from "./pages/SecurityPage";
import StockReportPage from "./pages/StockReportPage";
import StockMovementPage from "./pages/StockMovementPage";
import StockOpnamePage from "./pages/StockOpnamePage";
import DocumentationPage from "./pages/DocumentationPage";
import AIStudioPage from "./pages/AIStudioPage";
import { ApiManagementPage } from "./pages/ApiManagementPage";
import VendorsPage from "./pages/VendorsPage";
import AdminMonitorPage from "./pages/AdminMonitorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollRestoration />
        <AppProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/stock-movement" element={<StockMovementPage />} />
            <Route path="/stock-opname" element={<StockOpnamePage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/ai-studio" element={<AIStudioPage />} />
            <Route path="/api-management" element={<ApiManagementPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/admin-monitor" element={<AdminMonitorPage />} />
            <Route path="/stock-report" element={<StockReportPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;