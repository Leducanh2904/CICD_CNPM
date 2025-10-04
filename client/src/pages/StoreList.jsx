import { Card, Pagination } from "@windmill/react-ui";
import Spinner from "components/Spinner";
import { useStore } from "context/StoreContext"; 
import Layout from "layout/Layout";
import { useNavigate } from "react-router-dom";

const StoreList = () => {
  const { stores, setPage, isLoading } = useStore(); 
  const navigate = useNavigate();

  const handleChange = (page) => {
    setPage(page);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  if (isLoading) { 
    return (
      <Layout>
        <Spinner size={100} loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-20 mx-auto space-y-2">
        <h1 className="text-3xl font-bold mb-6 text-center">Danh sách Cửa hàng</h1>
        <Card className="flex flex-wrap h-full mx-2">
          {stores?.map((store) => (
            <div
              className="w-full flex flex-col justify-between sm:w-1/2 md:w-1/3 lg:w-1/4 my-2 px-2 box-border"
              key={store.id}
            >
              <div 
                onClick={() => navigate(`/stores/${store.id}`)} 
                style={{ cursor: 'pointer' }}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{store.name}</h2>
                <p className="text-gray-600 mb-2 line-clamp-3">{store.description || 'Mô tả cửa hàng'}</p>
                <p className="text-sm text-gray-500">Chủ: {store.owner_name}</p>
                <p className="text-sm text-gray-500">Email: {store.email || 'N/A'}</p>
                <p className="text-sm text-gray-500">SĐT: {store.phone || 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-2">Tạo: {new Date(store.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {(!stores || stores.length === 0) && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Chưa có cửa hàng nào.</p>
            </div>
          )}
        </Card>
        <Pagination
          totalResults={20} 
          resultsPerPage={12}
          onChange={handleChange}
          label="Page navigation"
        />
      </div>
    </Layout>
  );
};

export default StoreList;