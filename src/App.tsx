import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import IspRegistration from "./pages/IspRegistration";
import PlatformOwner from "./pages/PlatformOwner";
import IspProvider from "./pages/IspProvider";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppSidebar } from "./components/AppSidebar";
import { useAuth } from "./hooks/useAuth";

// Platform Owner Pages
import PlatformProviders from "./pages/platform-owner/Providers";
import PlatformRouters from "./pages/platform-owner/Routers";
import PlatformAnalytics from "./pages/platform-owner/Analytics";
import PlatformSettings from "./pages/platform-owner/Settings";

// ISP Provider Pages
import IspCustomers from "./pages/isp-provider/Customers";
import IspPackages from "./pages/isp-provider/Packages";
import IspRouters from "./pages/isp-provider/Routers";
import RouterDetailsPage from "./pages/RouterDetailsPage";
import IspNetwork from "./pages/isp-provider/Network";
import VLANConfiguration from "./pages/isp-provider/VLANConfiguration";
import FirewallRules from "./pages/isp-provider/FirewallRules";
import BandwidthControl from "./pages/isp-provider/BandwidthControl";
import IspBilling from "./pages/isp-provider/Billing";
import IspReports from "./pages/isp-provider/Reports";
import IspSettings from "./pages/isp-provider/Settings";

// Customer Pages
import CustomerAuth from "./pages/CustomerAuth";
import CustomerActivate from "./pages/CustomerActivate";
import CustomerDashboard from "./pages/customer/Dashboard";

const queryClient = new QueryClient();

const AppContent = () => {
  const { userRole } = useAuth();
  const location = useLocation();
  const showSidebar = userRole && location.pathname !== "/" && location.pathname !== "/auth";

  if (!showSidebar) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register-isp" element={<IspRegistration />} />
        <Route path="/features" element={<Features />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        
        {/* Customer Routes */}
        <Route path="/customer/login" element={<CustomerAuth />} />
        <Route path="/customer/activate/:token" element={<CustomerActivate />} />
        <Route path="/customer/dashboard" element={
          <ProtectedRoute requiredRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        
        <Route
          path="/platform-owner/*"
          element={
            <ProtectedRoute requiredRole="platform_owner">
              <PlatformOwner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/isp-provider/*"
          element={
            <ProtectedRoute requiredRole="isp_provider">
              <IspProvider />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        <AppSidebar userRole={userRole} />
        <div className="flex-1 flex flex-col relative z-0">
          <header className="h-14 border-b flex items-center px-3 md:px-4 bg-background sticky top-0 z-10">
            <SidebarTrigger className="mr-3 md:mr-4" />
            <div className="flex-1">
              {/* Space for additional header content if needed */}
            </div>
          </header>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/features" element={<Features />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              
              {/* Customer Routes */}
              <Route path="/customer/login" element={<CustomerAuth />} />
              <Route path="/customer/activate/:token" element={<CustomerActivate />} />
              <Route path="/customer/dashboard" element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              
              {/* Platform Owner Routes */}
              <Route
                path="/platform-owner"
                element={
                  <ProtectedRoute requiredRole="platform_owner">
                    <PlatformOwner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/platform-owner/providers"
                element={
                  <ProtectedRoute requiredRole="platform_owner">
                    <PlatformProviders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/platform-owner/routers"
                element={
                  <ProtectedRoute requiredRole="platform_owner">
                    <PlatformRouters />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/platform-owner/analytics"
                element={
                  <ProtectedRoute requiredRole="platform_owner">
                    <PlatformAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/platform-owner/settings"
                element={
                  <ProtectedRoute requiredRole="platform_owner">
                    <PlatformSettings />
                  </ProtectedRoute>
                }
              />

              {/* ISP Provider Routes */}
              <Route
                path="/isp-provider"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <IspProvider />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/customers"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <IspCustomers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/packages"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <IspPackages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/routers"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <IspRouters />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/routers/:routerId"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <RouterDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/network"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <IspNetwork />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/network/vlans"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <VLANConfiguration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/network/firewall"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <FirewallRules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/network/bandwidth"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <BandwidthControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/billing"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <IspBilling />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/reports"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <IspReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/isp-provider/settings"
                element={
                  <ProtectedRoute requiredRole="isp_provider">
                    <IspSettings />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
