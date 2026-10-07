import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import MotionProvider from './components/MotionProvider';
import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import BackToTop from './components/BackToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/ToastProvider';
import WhatsAppIcon from './components/WhatsAppIcon';
import { whatsappLink } from './lib/brand';
import HomePage from './pages/HomePage';

const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductScreen = lazy(() => import('./pages/ProductScreen'));
const CartScreen = lazy(() => import('./pages/CartScreen'));
const CheckoutScreen = lazy(() => import('./pages/CheckoutScreen'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const RegisterScreen = lazy(() => import('./pages/RegisterScreen'));
const ProfileScreen = lazy(() => import('./pages/ProfileScreen'));
const WishlistScreen = lazy(() => import('./pages/WishlistScreen'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Contact = lazy(() => import('./pages/Contact'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const ApparelCareGuide = lazy(() => import('./pages/ApparelCareGuide'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const NotFound = lazy(() => import('./pages/NotFound'));

// The admin panel is only downloaded by admins.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminAddProduct = lazy(() => import('./pages/admin/AdminAddProduct'));
const AdminEditProduct = lazy(() => import('./pages/admin/AdminEditProduct'));
const AdminFirstPhotoSection = lazy(() => import('./pages/admin/AdminFirstPhotoSection'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminPromotions = lazy(() => import('./pages/admin/AdminPromotions'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminInbox = lazy(() => import('./pages/admin/AdminInbox'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminSalesReports = lazy(() => import('./pages/admin/AdminSalesReports'));
const AdminProductReports = lazy(() => import('./pages/admin/AdminProductReports'));
const AdminCustomerReports = lazy(() => import('./pages/admin/AdminCustomerReports'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

const PageFallback = () => (
  <div className="rc-container" style={{ paddingBlock: 48 }} aria-busy="true" aria-label="Loading">
    <div className="rc-skeleton" style={{ height: 40, width: '40%', marginBottom: 24 }} />
    <div className="rc-grid">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rc-skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 10 }} />)}
    </div>
  </div>
);

const MainLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAdmin && <a href="#main" className="rc-skip-link">Skip to content</a>}
      {!isAdmin && <Header />}
      {/* min-height keeps the footer out of view until the page renders (no layout shift). */}
      <main id="main" style={{ flex: 1, width: '100%', minHeight: isAdmin ? undefined : '100vh' }}>
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <div key={isAdmin ? 'admin' : location.pathname} className={isAdmin ? undefined : 'rc-page-enter'}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ProductListPage />} />
              <Route path="/product/:id" element={<ProductScreen />} />
              <Route path="/cart/:id?" element={<CartScreen />} />
              <Route path="/checkout" element={<CheckoutScreen />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/wishlist" element={<WishlistScreen />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AdminAddProduct />} />
                <Route path="products/:id/edit" element={<AdminEditProduct />} />
                <Route path="first-photo" element={<AdminFirstPhotoSection />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="inbox" element={<AdminInbox />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="reports/sales" element={<AdminSalesReports />} />
                <Route path="reports/products" element={<AdminProductReports />} />
                <Route path="reports/customers" element={<AdminCustomerReports />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/care-guide" element={<ApparelCareGuide />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <CartDrawer />
          <a href={whatsappLink('Hi Rang and Craft! I have a question.')} target="_blank" rel="noopener noreferrer" className="rc-whatsapp" aria-label="Chat with us on WhatsApp">
            <WhatsAppIcon />
          </a>
          <BackToTop />
          <MobileBottomNav />
          <Cursor />
          <Preloader />
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <ToastProvider>
          <Router>
            <MotionProvider />
            <MainLayout />
            <SpeedInsights />
            <Analytics />
          </Router>
        </ToastProvider>
      </AppProvider>
    </HelmetProvider>
  );
}

export default App;
