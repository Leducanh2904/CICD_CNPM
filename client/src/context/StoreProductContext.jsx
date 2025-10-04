import { createContext, useContext, useEffect, useState } from "react";
import productService from "services/product.service";

const StoreProductContext = createContext();

const StoreProductProvider = ({ children, storeId }) => {
  const [products, setProducts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    setIsLoading(true);
    setError(null); 
    productService.getStoreProducts(storeId, page).then((response) => {
      console.log("Store products response:", response.data); 
      setProducts(response.data.data || response.data || []); 
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error fetching store products:", error); 
      setProducts([]);
      setError(error.response?.data?.message || error.message || "Không tải được sản phẩm");
      setIsLoading(false);
    });
  }, [storeId, page]);

  return (
    <StoreProductContext.Provider
      value={{ products, setProducts, isLoading, setIsLoading, page, setPage, error }}
    >
      {children}
    </StoreProductContext.Provider>
  );
};

const useStoreProduct = () => {
  const context = useContext(StoreProductContext);
  if (context === undefined) {
    throw new Error("useStoreProduct must be used within a StoreProductProvider");
  }
  return context;
};

export { StoreProductContext, StoreProductProvider, useStoreProduct };