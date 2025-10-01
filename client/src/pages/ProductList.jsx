import { Card, Pagination } from "@windmill/react-ui";
import Product from "components/Product";
import Spinner from "components/Spinner";
import { useProduct } from "context/ProductContext";
import Layout from "layout/Layout";
import { useNavigate } from "react-router-dom";  // ✅ THÊM: Để navigate trong Product

const ProductList = () => {
  const { products, setPage } = useProduct();
  const navigate = useNavigate();  // ✅ THÊM

  const handleChange = (page) => {
    setPage(page);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  if (!products) {
    return (
      <Layout>
        <Spinner size={100} loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-20 mx-auto space-y-2">
        <Card className="flex flex-wrap h-full mx-2">
          {products?.map((prod) => (
            <div
              className="w-full flex flex-col justify-between sm:w-1/2 md:w-1/3 lg:w-1/4 my-2 px-2 box-border"
              key={prod.id}
            >
              {/* ✅ FIX: Bỏ Link, dùng onClick navigate */}
              <div onClick={() => navigate(`/products/${prod.slug}`)} style={{ cursor: 'pointer' }}>
                <Product product={prod} />
              </div>
            </div>
          ))}
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

export default ProductList;