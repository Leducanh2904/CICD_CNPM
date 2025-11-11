import { Button, CardBody } from "@windmill/react-ui";
import { useCart } from "context/CartContext";
import { useState } from "react";
import { ShoppingCart } from "react-feather";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { formatCurrency } from "../helpers/formatCurrency";

const Product = ({ product }) => {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  // Lấy API_URL từ .env
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();  // ✅ FIX: Ngăn event bubble lên Link, tránh navigate khi add
    setIsLoading(true);
    try {
      if (!product || !product.id) {
        throw new Error("Sản phẩm không hợp lệ");
      }
      console.log('🔍 Add to cart product:', { id: product.id, name: product.name });  // Log debug
      await addItem(product, 1);
      toast.success("Added to cart");
    } catch (error) {
      console.error('🔍 Add to cart error:', error);  // Log error
      toast.error("Error adding to cart: " + (error.message || "Lỗi không xác định"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link to={`/products/${product.slug}`}>
      <div className="group">
        <span className="block relative h-48 rounded overflow-hidden">
          <img
            className="w-full h-full object-contain object-center"
            src={`${API_URL}${product.image_url}`}
            alt={product.name}
            loading="lazy"
            decoding="async"
            title={product.name}
          />
        </span>
        <CardBody className="flex flex-col items-stretch mt-4">
          <h2 className="title-font text-lg font-medium overflow-ellipsis whitespace-nowrap overflow-hidden">
            {product.name}
          </h2>
          <p className="">{formatCurrency(product.price)}</p>
          <Button
            iconLeft={() =>
              isLoading ? (
                <ClipLoader
                  cssOverride={{ margin: "0 auto" }}
                  color="#123abc"
                  size={20}
                />
              ) : (
                <ShoppingCart className="mr-2" />
              )
            }
            className="mt-4 transition duration-200 ease-out lg:bg-opacity-0 group-hover:bg-opacity-100"
            onClick={addToCart}  // ✅ Gọi trực tiếp, không (e) => vì đã có preventDefault
          >
            {isLoading ? null : "Add to Cart"}
          </Button>
        </CardBody>
      </div>
    </Link>
  );
};

export default Product;