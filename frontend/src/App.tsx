import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { SalonProvider } from "@/hooks/useSalon";
import { SuperAdminProvider } from "@/hooks/useSuperAdmin";
import "@/utils/adminBypass"; // Auto-enable admin bypass
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import CustomerSignup from "./pages/CustomerSignup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import { CartProvider } from "./context/CartContext";
import NewsletterPopup from "./components/NewsletterPopup";
import SiteLoader from "./components/SiteLoader";
import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/ThemeProvider";

const Signup = React.lazy(() => import("./pages/Signup"));
const BookAppointment = React.lazy(() => import("./pages/BookAppointment"));
const MyBookings = React.lazy(() => import("./pages/MyBookings"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const EditUserProfile = React.lazy(() => import("./pages/EditUserProfile"));
const ClinicalProfile = React.lazy(() => import("./pages/ClinicalProfile"));
const BookingTreatmentPage = React.lazy(() => import("./pages/BookingTreatmentPage"));
const DashboardHome = React.lazy(() => import("./pages/dashboard/DashboardHome"));
const CreateSalon = React.lazy(() => import("./pages/dashboard/CreateSalon"));
const AppointmentsPage = React.lazy(() => import("./pages/dashboard/AppointmentsPage"));
const StaffPage = React.lazy(() => import("./pages/dashboard/StaffPage"));
const StaffDetailsPage = React.lazy(() => import("./pages/dashboard/StaffDetailsPage"));
const StaffAttendancePage = React.lazy(() => import("./pages/dashboard/StaffAttendancePage"));
const ServicesPage = React.lazy(() => import("./pages/dashboard/ServicesPage"));
const CustomersPage = React.lazy(() => import("./pages/dashboard/CustomersPage"));
const CustomerDetailsPage = React.lazy(() => import("./pages/dashboard/CustomerDetailsPage"));
const SettingsPage = React.lazy(() => import("./pages/dashboard/SettingsPage"));
const BillingPage = React.lazy(() => import("./pages/dashboard/BillingPage"));
const InventoryPage = React.lazy(() => import("./pages/dashboard/InventoryPage"));
const ReportsPage = React.lazy(() => import("./pages/dashboard/ReportsPage"));
const OwnerProfile = React.lazy(() => import("./pages/dashboard/OwnerProfile"));
const OffersPage = React.lazy(() => import("./pages/dashboard/OffersPage"));
const NotificationsPage = React.lazy(() => import("./pages/dashboard/NotificationsPage"));
const StaffLeavesPage = React.lazy(() => import("./pages/dashboard/StaffLeavesPage"));
const SalonServices = React.lazy(() => import("./pages/SalonServices"));
const AllServicesSimple = React.lazy(() => import("./pages/AllServicesSimple"));
const ServiceDetail = React.lazy(() => import("./pages/ServiceDetail"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const AdminDashboardEnhanced = React.lazy(() => import("./pages/admin/AdminDashboardEnhanced"));
const AdminNotifications = React.lazy(() => import("./pages/admin/AdminNotifications"));
const AdminSalons = React.lazy(() => import("./pages/admin/AdminSalons"));
const AdminUsersEnhanced = React.lazy(() => import("./pages/admin/AdminUsersEnhanced"));
const AdminPaymentsEnhanced = React.lazy(() => import("./pages/admin/AdminPaymentsEnhanced"));
const AdminMarketing = React.lazy(() => import("./pages/admin/AdminMarketing"));
const AdminReports = React.lazy(() => import("./pages/admin/AdminReports"));
const AdminReviews = React.lazy(() => import("./pages/admin/AdminReviews"));
const AdminSettings = React.lazy(() => import("./pages/admin/AdminSettings"));
const AdminProducts = React.lazy(() => import("./pages/admin/AdminProducts"));
const AdminAddProduct = React.lazy(() => import("./pages/admin/AdminAddProduct"));
const AdminContactEnquiries = React.lazy(() => import("./pages/admin/AdminContactEnquiries"));
const AdminMembershipPlans = React.lazy(() => import("./pages/admin/AdminMembershipPlans"));
const AdminMembers = React.lazy(() => import("./pages/admin/AdminMembers"));
const AdminOrdersPage = React.lazy(() => import("./pages/AdminOrders"));
const SimpleAdminAccess = React.lazy(() => import("./pages/SimpleAdminAccess"));
const TestAdminLogin = React.lazy(() => import("./pages/TestAdminLogin"));
const SalonOwnerSignup = React.lazy(() => import("./pages/Signup"));
const ClientHub = React.lazy(() => import("./pages/ClientHub"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const RetailShop = React.lazy(() => import("./pages/RetailShop"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const SessionHistory = React.lazy(() => import("./pages/SessionHistory"));
const CartPage = React.lazy(() => import("./pages/CartPage"));
const CheckoutPage = React.lazy(() => import("./pages/CheckoutPage"));
const TestEmail = React.lazy(() => import("./pages/TestEmail"));
const MembershipDetailsPage = React.lazy(() => import("./pages/MembershipDetailsPage"));
const PublicInvoicePage = React.lazy(() => import("./pages/PublicInvoicePage"));


const queryClient = new QueryClient();

const App = () => {
  const isAdminSubdomain = 
    window.location.hostname.startsWith('admin.') || 
    localStorage.getItem('simulate_admin_subdomain') === 'true';
  console.log("[App.tsx] App component rendering...");
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  React.useEffect(() => {
    console.log("[App.tsx] Initial loading effect triggered...");
    // Simulate initial load or wait for resources
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          {isInitialLoading && <SiteLoader key="loader" />}
        </AnimatePresence>
        <AuthProvider>
          <ThemeProvider>
            <NewsletterPopup />
            <SuperAdminProvider>
              <SalonProvider>
                <CartProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <ScrollToTop />
                    <div id="app-routes-container">
                      <React.Suspense fallback={<SiteLoader />}>
                        <Routes>
                          <Route path="/" element={isAdminSubdomain ? <SimpleAdminAccess /> : <Index />} />
                          <Route path="/about" element={<AboutUs />} />
                          <Route path="/salons" element={<SalonOwnerSignup />} />
                          <Route path="/salons/:id" element={<SalonOwnerSignup />} />
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/shop" element={<RetailShop />} />
                          <Route path="/product/:id" element={<ProductDetails />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/services/:id" element={<ServiceDetail />} />
                          <Route path="/services-simple" element={<AllServicesSimple />} />
                          <Route path="/admin-access" element={<SimpleAdminAccess />} />
                          <Route path="/admin-access-full" element={<Navigate to="/admin-access" replace />} />
                          <Route path="/test-admin" element={<TestAdminLogin />} />
                          <Route path="/debug-supabase" element={<Navigate to="/admin-access" replace />} />
                          <Route path="/supabase-debug" element={<Navigate to="/admin-access" replace />} />
                          <Route path="/create-admin" element={<Navigate to="/admin-access" replace />} />
                          <Route path="/direct-admin" element={<Navigate to="/admin-access" replace />} />
                          <Route path="/login" element={isAdminSubdomain ? <SimpleAdminAccess /> : <Login />} />
                          <Route path="/signup" element={<CustomerSignup />} />
                          <Route path="/membership" element={<MembershipDetailsPage />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/salon-owner/signup" element={<SalonOwnerSignup />} />
                          <Route path="/salon-owner/login" element={<Login />} />
                          <Route path="/book" element={<BookAppointment />} />
                          <Route path="/book/:id" element={<BookAppointment />} />
                          <Route path="/contact" element={<ContactUs />} />
                          <Route path="/test-email" element={<TestEmail />} />
                          <Route path="/payment-success" element={<PaymentSuccess />} />
                          <Route path="/invoices/:id" element={<PublicInvoicePage />} />

                          {/* USER (Customer) Routes */}
                          <Route path="/user/dashboard" element={
                            <RoleProtectedRoute allowedRole="USER">
                              <ClientHub />
                            </RoleProtectedRoute>
                          } />
                          <Route path="/my-bookings" element={
                            <RoleProtectedRoute allowedRole="USER">
                              <MyBookings />
                            </RoleProtectedRoute>
                          } />
                          <Route path="/my-bookings/:id/treatment" element={
                            <RoleProtectedRoute allowedRole="USER">
                              <BookingTreatmentPage />
                            </RoleProtectedRoute>
                          } />
                          <Route path="/user/profile" element={
                            <RoleProtectedRoute allowedRole="USER">
                              <UserProfile />
                            </RoleProtectedRoute>
                          } />
                          <Route path="/user/profile/edit" element={
                            <RoleProtectedRoute allowedRole="USER">
                              <EditUserProfile />
                            </RoleProtectedRoute>
                          } />
                          <Route path="/user/sessions" element={
                            <RoleProtectedRoute allowedRole="USER">
                              <SessionHistory />
                            </RoleProtectedRoute>
                          } />
                          <Route path="/user/health" element={
                            <RoleProtectedRoute allowedRole="USER">
                              <ClinicalProfile />
                            </RoleProtectedRoute>
                          } />

                        {/* SALON_OWNER Routes */}
                        <Route path="/salon/dashboard" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <DashboardHome />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/create-salon" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <CreateSalon />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/appointments" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <AppointmentsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/staff" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <StaffPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/staff/:id" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <StaffDetailsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/services" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <ServicesPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/customers" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <CustomersPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/customers/:userId" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <CustomerDetailsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/inventory" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <InventoryPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/reports" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <ReportsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/billing" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <BillingPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/offers" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <OffersPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/settings" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <SettingsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/notifications" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <NotificationsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/salon/profile" element={
                          <RoleProtectedRoute allowedRole="SALON_OWNER">
                            <OwnerProfile />
                          </RoleProtectedRoute>
                        } />

                        {/* STAFF Routes */}
                        <Route path="/staff/dashboard" element={
                          <RoleProtectedRoute allowedRole="STAFF">
                            <DashboardHome />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/staff/attendance" element={
                          <RoleProtectedRoute allowedRole="STAFF">
                            <StaffAttendancePage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/staff/leaves" element={
                          <RoleProtectedRoute allowedRole="STAFF">
                            <StaffLeavesPage />
                          </RoleProtectedRoute>
                        } />
                        {/* <Route path="/staff/messages" element={
                        <RoleProtectedRoute allowedRole="STAFF">
                          <StaffMessagesPage />
                        </RoleProtectedRoute>
                      } /> */}
                        <Route path="/staff/customers" element={
                          <RoleProtectedRoute allowedRole="STAFF">
                            <CustomersPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/staff/customers/:userId" element={
                          <RoleProtectedRoute allowedRole="STAFF">
                            <CustomerDetailsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/staff/profile/:id" element={
                          <RoleProtectedRoute allowedRole="STAFF">
                            <StaffDetailsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/staff/notifications" element={
                          <RoleProtectedRoute allowedRole="STAFF">
                            <NotificationsPage />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/staff/profile" element={
                          <RoleProtectedRoute allowedRole="STAFF">
                            <Navigate to="/staff/dashboard" replace />
                          </RoleProtectedRoute>
                        } />

                        {/* SUPER_ADMIN Routes */}
                        <Route path="/super-admin/dashboard" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminDashboardEnhanced />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/salons" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminSalons />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/payments" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminPaymentsEnhanced />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/users" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminUsersEnhanced />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/plans" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminMembershipPlans />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/analytics" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminReports />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/marketing" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminMarketing />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/notifications" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminNotifications />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/products" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminProducts />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/products/add" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminAddProduct />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/contact-enquiries" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminContactEnquiries />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/members" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminMembers />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/reviews" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminReviews />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/settings" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminSettings />
                          </RoleProtectedRoute>
                        } />
                        <Route path="/super-admin/orders" element={
                          <RoleProtectedRoute allowedRole="SUPER_ADMIN">
                            <AdminOrdersPage />
                          </RoleProtectedRoute>
                        } />

                        {/* Fallbacks and Legacy Redirects */}
                        <Route path="/dashboard" element={<Navigate to="/salon/dashboard" replace />} />
                        <Route path="/dashboard/notifications" element={<Navigate to="/salon/notifications" replace />} />
                        <Route path="/dashboard/profile" element={<Navigate to="/salon/profile" replace />} />
                        <Route path="/dashboard/staff" element={<Navigate to="/salon/staff" replace />} />
                        <Route path="/dashboard/appointments" element={<Navigate to="/salon/appointments" replace />} />
                        <Route path="/dashboard/customers" element={<Navigate to="/salon/customers" replace />} />
                        <Route path="/dashboard/billing" element={<Navigate to="/salon/billing" replace />} />
                        <Route path="/dashboard/services" element={<Navigate to="/salon/services" replace />} />
                        <Route path="/dashboard/inventory" element={<Navigate to="/salon/inventory" replace />} />
                        <Route path="/dashboard/reports" element={<Navigate to="/salon/reports" replace />} />
                        <Route path="/dashboard/offers" element={<Navigate to="/salon/offers" replace />} />
                        <Route path="/dashboard/settings" element={<Navigate to="/salon/settings" replace />} />
                        <Route path="/dashboard/create-salon" element={<Navigate to="/salon/create-salon" replace />} />
                        <Route path="/admin" element={<Navigate to="/super-admin/dashboard" replace />} />
                        <Route path="/client-hub" element={<Navigate to="/user/dashboard" replace />} />

                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/cookies" element={<CookiePolicy />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </React.Suspense>
                    </div>
                  </TooltipProvider>
                </CartProvider>
              </SalonProvider>
            </SuperAdminProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider >
  );
};

export default App;
