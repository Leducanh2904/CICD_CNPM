import { Button } from "@windmill/react-ui";
import { useCart } from "context/CartContext";
import { formatCurrency } from "helpers/formatCurrency";
import Layout from "layout/Layout";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactStars from "react-rating-stars-component";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import productService from "services/product.service";

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const addToCart = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addItem(product, 1);
      toast.success("Added to cart");
    } catch (error) {
      console.error(error);
      toast.error("Error adding to cart");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const { data: productData } = await productService.getProductBySlug(slug);
        setProduct(productData);
      } catch (error) {
        console.error('❌ Fetch product error:', error.response?.status, error.response?.data);
        navigate("/404", { replace: true });
      } finally {
        setIsFetching(false);
      }
    }
    fetchData();
  }, [slug, navigate]);

  // ✅ Helper để build full URL ảnh từ BE (relative path + BE base URL)
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      // Fallback nếu không có ảnh (tạo file placeholder.jpg ở src/public nếu cần)
      return 'https://via.placeholder.com/400x400?text=No+Image';  // Placeholder online tạm thời
    }
    // Dev: localhost:10000; Prod: từ env VITE_API_URL (bỏ /api)
    const baseUrl = import.meta.env.PROD
      ? (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : window.location.origin)
      : 'http://localhost:10000';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <Layout loading={isFetching} title={product?.name}>
      <section className="body-font overflow-hidden">
        <div className="container px-5 py-24 mx-auto">
          <div className="lg:w-4/5 mx-auto flex flex-wrap">
            <img
              decoding="async"
              loading="lazy"
              src={getImageUrl(product?.image_url)} 
              alt={product?.name || 'Product image'}
              className="lg:w-1/2 w-full lg:h-auto h-64 object-contain md:object-cover object-center rounded"
              onError={(e) => {  // ✅ Fallback nếu ảnh load fail
                console.warn('⚠️ Image failed to load for:', product?.name, 'URL:', e.target.src);
                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';  // Placeholder online
              }}
            />
            <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
              <h1 className="text-3xl title-font font-medium mb-1">{product?.name}</h1>
              <div className="flex mb-4">
                <span className="flex items-center">
                  <ReactStars
                    count={5}
                    size={24}
                    edit={false}
                    value={+product?.avg_rating || 0}  // ✅ Fallback 0 nếu không có rating
                    activeColor="#ffd700"
                  />
                  <span className="ml-3">
                    {+product?.review_count > 0
                      ? `${+product.review_count} Ratings`
                      : "No ratings available"}
                  </span>
                </span>
              </div>
              <p className="leading-relaxed pb-6 border-b-2 border-gray-800">
                {product?.description || 'No description available.'} 
              </p>
              <div className="flex mt-4 justify-between">
                <span className="title-font font-medium text-2xl">
                  {formatCurrency(product?.price || 0)}
                </span>
                <Button
                  className="border-0 focus:outline-none rounded"
                  onClick={addToCart}
                  disabled={!product}  // ✅ Disable button nếu chưa load product
                >
                  {isLoading ? (
                    <ClipLoader cssOverride={{ margin: "0 auto" }} color="#123abc" size={20} />
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetails;