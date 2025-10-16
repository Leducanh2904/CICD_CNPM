import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/admin/dashboard" className="hover:text-yellow-400">Dashboard</Link>
          <Link to="/admin/products" className="hover:text-yellow-400">Stores</Link>
          <Link to="/admin/orders" className="hover:text-yellow-400">Orders</Link>
        </nav>
      </aside>

      {/* Nội dung */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet /> {/* render các trang con */}
      </main>
    </div>
  );
};

export default AdminLayout;
