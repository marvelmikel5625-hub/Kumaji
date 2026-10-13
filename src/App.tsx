import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { MarketplaceProvider } from './context/MarketplaceContext';

import { ScrollToTop } from './components/common/ScrollToTop';
import { Header } from './components/common/Header';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Footer } from './components/common/Footer';
import { MerchantRoute, AdminRoute } from './components/common/ProtectedRoute';

// Public Marketplace Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

// Authentication Pages
import { AuthPage } from './pages/AuthPage';
import { MerchantAuthPage } from './pages/MerchantAuthPage';

// Customer Account Pages
import { AccountPage } from './pages/account/AccountPage';
import { OrdersPage } from './pages/account/OrdersPage';
import { AddressesPage } from './pages/account/AddressesPage';
import { WishlistPage } from './pages/account/WishlistPage';

// Multi-Vendor Merchant Pages
import { SellerRegisterPage } from './pages/seller/SellerRegisterPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { SellerAddProductPage } from './pages/seller/SellerAddProductPage';
import { SellerOrdersPage } from './pages/seller/SellerOrdersPage';
import { SellerEarningsPage } from './pages/seller/SellerEarningsPage';
import { SellerProductAnalyticsPage } from './pages/seller/SellerProductAnalyticsPage';
import { SellerReviewsPage } from './pages/seller/SellerReviewsPage';
import { SellerDeliveryPage } from './pages/seller/SellerDeliveryPage';
import { SellerSettingsPage } from './pages/seller/SellerSettingsPage';

// Platform Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSellersPage } from './pages/admin/AdminSellersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminFinancePage } from './pages/admin/AdminFinancePage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <MarketplaceProvider>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen text-[#252525] bg-[#FBFBFB]">
                {/* Header (Option A mobile header with centered wordmark + desktop header) */}
                <Header />

                {/* Main Content Viewport */}
                <main className="flex-1 pb-16 lg:pb-0">
                  <Routes>
                    {/* Marketplace Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/category/:categorySlug" element={<SearchPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />

                    {/* Customer Authentication Routes */}
                    <Route path="/auth/sign-in" element={<AuthPage />} />
                    <Route path="/auth/sign-up" element={<AuthPage />} />

                    {/* Dedicated Merchant Authentication Routes */}
                    <Route path="/merchant/sign-in" element={<MerchantAuthPage />} />
                    <Route path="/merchant/login" element={<Navigate to="/merchant/sign-in" replace />} />
                    <Route path="/seller/login" element={<Navigate to="/merchant/sign-in" replace />} />
                    <Route path="/merchant/sign-up" element={<Navigate to="/seller/register" replace />} />

                    {/* Customer Account Routes */}
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/account/orders" element={<OrdersPage />} />
                    <Route path="/account/orders/:id" element={<OrdersPage />} />
                    <Route path="/account/addresses" element={<AddressesPage />} />
                    <Route path="/account/wishlist" element={<WishlistPage />} />

                    {/* Merchant Registration & Application */}
                    <Route path="/seller/register" element={<SellerRegisterPage />} />

                    {/* Protected Merchant Operations Routes */}
                    <Route
                      path="/seller"
                      element={
                        <MerchantRoute>
                          <SellerDashboardPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/products"
                      element={
                        <MerchantRoute>
                          <SellerProductsPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/products/new"
                      element={
                        <MerchantRoute>
                          <SellerAddProductPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/products/edit/:id"
                      element={
                        <MerchantRoute>
                          <SellerAddProductPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/orders"
                      element={
                        <MerchantRoute>
                          <SellerOrdersPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/earnings"
                      element={
                        <MerchantRoute>
                          <SellerEarningsPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/analytics"
                      element={
                        <MerchantRoute>
                          <SellerProductAnalyticsPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/analytics/:productId"
                      element={
                        <MerchantRoute>
                          <SellerProductAnalyticsPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/products/:productId/analytics"
                      element={
                        <MerchantRoute>
                          <SellerProductAnalyticsPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/reviews"
                      element={
                        <MerchantRoute>
                          <SellerReviewsPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/delivery"
                      element={
                        <MerchantRoute>
                          <SellerDeliveryPage />
                        </MerchantRoute>
                      }
                    />
                    <Route
                      path="/seller/settings"
                      element={
                        <MerchantRoute>
                          <SellerSettingsPage />
                        </MerchantRoute>
                      }
                    />

                    {/* Protected Platform Super Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboardPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/sellers"
                      element={
                        <AdminRoute>
                          <AdminSellersPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <AdminRoute>
                          <AdminProductsPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <AdminRoute>
                          <AdminOrdersPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/finance"
                      element={
                        <AdminRoute>
                          <AdminFinancePage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/settings"
                      element={
                        <AdminRoute>
                          <AdminSettingsPage />
                        </AdminRoute>
                      }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                {/* Persistent Bottom Mobile Navigation */}
                <MobileBottomNav />

                {/* Marketplace Footer */}
                <Footer />
              </div>
            </MarketplaceProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
