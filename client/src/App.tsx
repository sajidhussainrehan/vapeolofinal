import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { DistributorProvider } from "@/contexts/DistributorContext";
import CartModal from "@/components/CartModal";
import Home from "@/pages/Home";
import Affiliates from "@/pages/Affiliates";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProfile from "@/pages/AdminProfile";
import AdminUsers from "@/pages/AdminUsers";
import AdminAffiliates from "@/pages/AdminAffiliates";
import AdminProducts from "@/pages/AdminProducts";
import AdminHomepage from "@/pages/AdminHomepage";
import DistributorLogin from "@/pages/DistributorLogin";
import DistributorDashboard from "@/pages/DistributorDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/affiliates" component={Affiliates} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/profile" component={AdminProfile} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/affiliates" component={AdminAffiliates} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/homepage" component={AdminHomepage} />
      <Route path="/distributor/login" component={DistributorLogin} />
      <Route path="/distributor/dashboard" component={DistributorDashboard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DistributorProvider>
          <CartProvider>
            <AuthProvider>
              <Toaster />
              <Router />
              <CartModal />
            </AuthProvider>
          </CartProvider>
        </DistributorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
