import Spinner from "components/Spinner";
import Layout from "layout/Layout";
import {
  Account,
  Cart,
  Checkout,
  Confirmation,
  Login,
  NotFound,
  OrderDetails,
  Orders,
  Register,
  ResetPassword,
} from "pages";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "routes/protected.route";

import StoreList from "pages/StoreList";
import { StoreProvider } from "context/StoreContext";

import StoreDetails from "pages/StoreDetails";
import ProductDetails from "pages/ProductDetails"; 
import AdminLayout from "admin/AdminLayout";
import AdminDashboard from "admin/pages/Dashboard";
import AdminProducts from "admin/pages/Stores";
import AdminOrders from "admin/pages/Orders";
import Users from "admin/pages/Users";
import SellerLayout from "seller/SellerLayout";
import SellerDashboard from "seller/pages/Dashboard";
import SellerMenu from "seller/pages/Menu";
import SellerOrders from "seller/pages/Orders";

function App() {
  return (
    <StoreProvider>
      <Suspense
        fallback={
          <Layout>
            <Spinner size={100} />
          </Layout>
        }
      >
        <Toaster position="top-right" />
        <Routes>
          {/* Protected Routes - giữ nguyên */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Account />} />
            <Route path="/cart/checkout" element={<Checkout />} />
            <Route path="/cart/success" element={<Confirmation />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id/" element={<OrderDetails />} />
          </Route>

          {/* Public Routes */}
          <Route path="/signup" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route index element={<StoreList />} />
          <Route path="/stores/:id" element={<StoreDetails />} />
          <Route path="/products/:slug" element={<ProductDetails />} />  // ✅ THÊM: Route chi tiết sản phẩm
          <Route path="/cart" element={<Cart />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Routes - giữ nguyên */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<Users />} />
          </Route>

          {/* Seller Routes - thêm mới */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="menu" element={<SellerMenu />} />
            <Route path="orders" element={<SellerOrders />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Suspense>
    </StoreProvider>
  );
}

export default App;