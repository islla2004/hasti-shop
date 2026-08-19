import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StorefrontLayout from './components/layout/StorefrontLayout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ChadorPage from './pages/ChadorPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import InstallmentTermsPage from './pages/InstallmentTermsPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminRoutes from './admin/AdminRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/chador" element={<ChadorPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/installment-terms" element={<InstallmentTermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
