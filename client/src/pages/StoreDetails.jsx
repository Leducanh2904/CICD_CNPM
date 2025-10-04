// pages/StoreDetails.jsx
import { Card, Pagination } from "@windmill/react-ui";
import Spinner from "components/Spinner";
import { useStoreProduct } from "context/StoreProductContext";
import { StoreProductProvider } from "context/StoreProductContext";
import API from "api/axios.config";
import Layout from "layout/Layout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StoreDetailsContent = () => {
  const { id } = useParams(); // store_id từ route
  const [store, setStore] = useState(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [error, setError] = useState(null); // Handle error cho fetch store
  const { products, setPage, isLoading, error: productsError } = useStoreProduct(); // Lấy error từ context products
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStore = async () => {
      setError(null); // Reset error
      try {
        console.log(`Fetching store ID: ${id}`); // Log để debug
        const response = await API.get(`/stores/${id}`);
        console.log("API Response:", response.data); // Log full response
        if (response.data.success) {
          setStore(response.data.data);
        } else {
          // Không navigate, set error
          setError(response.data.message || "Không thể tải thông tin cửa hàng");
          console.warn("API success false:", response.data.message);
        }
      } catch (error) {
        console.error("Fetch store error:", error); // Log chi tiết error
        // Không navigate, set error
        setError(error.response?.data?.message || error.message || "Lỗi kết nối server");
      } finally {
        setStoreLoading(false);
      }
    };
    fetchStore();
  }, [id, navigate]);

  const handleChange = (page) => {
    setPage(page);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  // ✅ THÊM: Helper function prefix image URL
  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return '';
    return `${import.meta.env.VITE_API_URL}${imageUrl}`;
  };

  if (storeLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size={100} loading />
        </div>
      </Layout>
    );
  }

  if (error) {
    // Hiển thị error thay vì redirect
    return (
      <Layout>
        <div className="container py-20 mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Lỗi</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate("/")} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Quay về danh sách cửa hàng
          </button>
        </div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout>
        <div className="container py-20 mx-auto text-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-20 mx-auto space-y-6">
        {/* Header: Info cửa hàng */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
          <p className="text-gray-600 mb-4 text-lg">{store.description || "Cửa hàng chất lượng cao."}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <p><span className="font-semibold">Chủ sở hữu:</span> {store.owner_name}</p>
            <p><span className="font-semibold">Email:</span> {store.email || 'N/A'}</p>
            <p><span className="font-semibold">Điện thoại:</span> {store.phone || 'N/A'}</p>
            <p><span className="font-semibold">Địa chỉ:</span> {store.address_line1 || ''} {store.address_line2 ? `, ${store.address_line2}` : ''}, {store.city || ''}, {store.country || 'VN'}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tạo lúc: {new Date(store.created_at).toLocaleDateString()}</p>
        </div>

        {/* List products của store */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Sản phẩm ({products?.length || 0})</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size={100} loading />
            </div>
          ) : productsError ? (
            // Hiển thị error từ products API
            <div className="text-center py-8 text-red-500">
              <p>{productsError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <Card className="flex flex-wrap h-full mx-2">
                {products?.map((product) => (
                  <div
                    className="w-full flex flex-col justify-between sm:w-1/2 md:w-1/3 lg:w-1/4 my-2 px-2 box-border"
                    key={product.id}
                  >
                    <div 
                      onClick={() => navigate(`/products/${product.slug}`)} 
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      {product.image_url && (
                        <img 
                          src={getImageSrc(product.image_url)}  // ✅ SỬA: Prefix backend URL
                          alt={product.name} 
                          className="w-full h-48 object-cover rounded mb-2" 
                          onError={(e) => console.log("Image load error:", e.target.src)}  // Log nếu fail
                        />
                      )}
                      <h3 className="text-lg font-semibold mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 mb-2 line-clamp-2 text-sm">{product.description}</p>
                      <p className="text-xl font-bold text-green-600 mb-1">₫{parseFloat(product.price).toLocaleString()}</p>
                      <p className="text-sm text-yellow-500 mb-1">★ {product.avg_rating || 0} ({product.review_count || 0} đánh giá)</p>
                      <p className="text-sm text-gray-500">Còn {product.stock} sản phẩm</p>
                      {product.stock === 0 && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded mt-1 inline-block">Hết hàng</span>}
                    </div>
                  </div>
                ))}
                {(!products || products.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Cửa hàng chưa có sản phẩm nào.
                  </div>
                )}
              </Card>
              {products && products.length > 0 && (
                <Pagination
                  totalResults={20}  // Có thể lấy từ API.total sau
                  resultsPerPage={12}
                  onChange={handleChange}
                  label="Phân trang sản phẩm"
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

const StoreDetails = () => {
  const { id } = useParams();
  return (
    <StoreProductProvider storeId={id}>
      <StoreDetailsContent />
    </StoreProductProvider>
  );
};

export default StoreDetails;