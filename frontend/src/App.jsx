import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Stores from './pages/Stores';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Rewards from './pages/Rewards';
import Cart from './pages/Cart';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Assistant from './pages/Assistant';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import { OrderSuccess, Wishlist, Coupons, Profile } from './pages/Account';
import { Notifications, Referral, Claim } from './pages/More';
import { useApp } from './context/AppContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Protected = ({ children }) => {
  const { user } = useApp();
  const loc = useLocation();
  return user ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
  );
};

const AdminOnly = ({ children }) => {
  const { user } = useApp();
  const loc = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  }
  return user.role === 'admin' ? children : <Navigate to="/" replace />;
};

const protectedRoutes = [
  { path: '/cart', element: <Cart /> },
  { path: '/assistant', element: <Assistant /> },
  { path: '/orders', element: <Orders /> },
  { path: '/wallet', element: <Wallet /> },
  { path: '/checkout', element: <Checkout /> },
  { path: '/order-success', element: <OrderSuccess /> },
  { path: '/wishlist', element: <Wishlist /> },
  { path: '/coupons', element: <Coupons /> },
  { path: '/referral', element: <Referral /> },
  { path: '/profile', element: <Profile /> },
  { path: '/notifications', element: <Notifications /> },
  { path: '/claim/:code', element: <Claim /> },
];

export default function App() {
  const { toast } = useApp();

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/login" element={<Login />} />

          {/* Logged-in users */}
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={<Protected>{element}</Protected>} />
          ))}

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminOnly>
                <Admin />
              </AdminOnly>
            }
          />

          <Route
            path="*"
            element={
              <div className="wrap empty">
                <h2>Page not found</h2>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
      {toast && (
        <div className={`toast ${toast.type}`} role="status">
          {toast.msg}
        </div>
      )}
    </>
  );
}