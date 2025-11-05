import { Outlet, Link, useNavigate } from "react-router-dom"; 
import { useEffect } from "react"; 

const AdminLayout = () => {
  const navigate = useNavigate();

const handleLogout = () => {
  console.log("Logout clicked");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.clear(); 
  document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  setTimeout(() => {
  window.location.href = "http://localhost:3001/login";
  }, 100 );
};

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/admin" className="hover:text-yellow-400">Dashboard</Link>
          <Link to="/admin/products" className="hover:text-yellow-400">Stores</Link>
          <Link to="/admin/orders" className="hover:text-yellow-400">Orders</Link>
          <Link to="/admin/users" className="hover:text-yellow-400">Users</Link>
          {/* ✅ THÊM: Nút Logout ở cuối nav */}
          <button 
            onClick={handleLogout} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
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