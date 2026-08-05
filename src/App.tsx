import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/AuthContext';
import { queryClient } from '@/lib/query-client';
import { CartProvider } from '@/components/store/CartContext';
import StoreLayout from '@/components/store/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';

import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Account from '@/pages/Account';
import Admin from '@/pages/Admin';
import Deals from '@/pages/Deals';
import SearchPage from '@/pages/Search';
import Favorites from '@/pages/Favorites';
import Compare from '@/pages/Compare';
import Testimonials from '@/pages/Testimonials';
import Contact from '@/pages/Contact';
import Returns from '@/pages/Returns';
import DeliveryPayment from '@/pages/DeliveryPayment';
import Offer from '@/pages/Offer';
import Privacy from '@/pages/Privacy';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Categories from '@/pages/Categories';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <CartProvider>
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:categoryId" element={<Catalog />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/delivery-payment" element={<DeliveryPayment />} />
                <Route path="/offer" element={<Offer />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route
                  element={
                    <ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />
                  }
                >
                  <Route path="/account" element={<Account />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </CartProvider>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </AuthProvider>
  );
}
