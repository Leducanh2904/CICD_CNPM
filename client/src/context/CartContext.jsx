// src/context/CartContext.jsx - FIXED: Refetch full cart sau mỗi API action để sync items chính xác
import localCart from "helpers/localStorage";
import { createContext, useContext, useMemo, useEffect, useState, useCallback } from "react";
import cartService from "services/cart.service";
import { useUser } from "./UserContext";
import toast from "react-hot-toast";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartData, setCartData] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(false);
  
  const { isLoggedIn } = useUser();

  // ✅ useEffect 1: Fetch/Sync cart khi isLoggedIn thay đổi (giữ nguyên)
  useEffect(() => {
    setIsLoading(true);

    const syncCart = async () => {
      if (isLoggedIn) {
        try {
          // Sync local -> server nếu có items local
          const items = localCart.getItems();
          if (items && items.length > 0) {
            const cartPromises = items.map(({ product_id, quantity }) =>
              cartService.addToCart(product_id, quantity).catch(err => {
                console.error('Lỗi sync item:', err.response?.data);
                return null;
              })
            );
            await Promise.all(cartPromises);
            localCart.clearCart();
          }

          // Fetch từ server
          const res = await cartService.getCart();
          const fetchedItems = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
          setCartData({ items: fetchedItems });
        } catch (error) {
          console.error('Lỗi fetch cart sau login:', error.response?.status, error.response?.data);
          toast.error("Lỗi tải giỏ hàng");
          const localItems = localCart.getItems() || [];
          setCartData({ items: localItems });
        }
      } else {
        const items = localCart.getItems() || [];
        setCartData({ items });
      }
      setIsLoading(false);
    };

    syncCart();
  }, [isLoggedIn]);

  // ✅ useMemo derive totals (giữ nguyên - immediate update)
  const { cartTotal, cartSubtotal } = useMemo(() => {
    const items = cartData?.items || [];
    const quantity = items.reduce((acc, cur) => acc + Number(cur.quantity || 0), 0);
    const totalAmt = items.reduce((acc, cur) => {
      return acc + Number(cur.subtotal || (cur.price * (cur.quantity || 0)) || 0);
    }, 0);
    return { cartTotal: quantity, cartSubtotal: totalAmt };
  }, [cartData]);

  // ✅ Helper: Refetch full cart từ server (chỉ logged in)
  const refetchCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        const res = await cartService.getCart();
        const fetchedItems = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        setCartData({ items: fetchedItems });
      } catch (error) {
        console.error('Lỗi refetch cart:', error);
        toast.error("Lỗi cập nhật giỏ hàng");
      }
    }
  }, [isLoggedIn]);

  // ✅ Helper: Optimistic update (giữ nguyên)
  const optimisticUpdate = useCallback((updateFn, fallbackFn) => {
    const prevItems = cartData.items || [];
    updateFn();
    return () => fallbackFn(prevItems);
  }, [cartData.items]);

  // ✅ addItem: Optimistic + API + refetch full cart
  const addItem = async (product, quantity = 1) => {
    if (!product || !product.id) {
      throw new Error("Sản phẩm không hợp lệ");
    }

    const newItem = { ...product, quantity, product_id: product.id, subtotal: product.price * quantity };
    let rollback;

    if (isLoggedIn) {
      // Optimistic add
      rollback = optimisticUpdate(
        () => setCartData({ items: [...(cartData.items || []), newItem] }),
        (prevItems) => setCartData({ items: prevItems })
      );

      try {
        await cartService.addToCart(product.id, quantity); // Await confirm, không cần response items
        await refetchCart(); // ✅ FIX: Refetch full để sync chính xác
        rollback = null;
      } catch (error) {
        rollback();
        console.error('Lỗi add item:', error.response?.status, error.response?.data || error.message);
        toast.error("Thêm giỏ hàng thất bại: " + (error.response?.data?.message || "Lỗi không xác định"));
        throw error;
      }
    } else {
      // Guest: Sync local
      localCart.addItem(product, quantity);
      const newItems = localCart.getItems() || [];
      setCartData({ items: newItems });
    }
  };

  // ✅ deleteItem: Optimistic + API + refetch
  const deleteItem = async (product_id) => {
    const prevItems = cartData.items || [];
    const newItems = prevItems.filter((item) => item.product_id !== product_id);
    let rollback;

    if (isLoggedIn) {
      rollback = optimisticUpdate(
        () => setCartData({ items: newItems }),
        () => setCartData({ items: prevItems })
      );

      try {
        await cartService.removeFromCart(product_id);
        await refetchCart(); // ✅ FIX: Refetch full
        rollback = null;
      } catch (error) {
        rollback();
        console.error('Lỗi delete item:', error.response?.status, error.response?.data);
        toast.error("Xóa giỏ hàng thất bại");
      }
    } else {
      localCart.removeItem(product_id);
      const newItems = localCart.getItems() || [];
      setCartData({ items: newItems });
    }
  };

  // ✅ increment: Optimistic + API + refetch
  const increment = async (product_id) => {
    const prevItems = cartData.items || [];
    const updatedItems = prevItems.map(item =>
      item.product_id === product_id ? { ...item, quantity: (item.quantity || 0) + 1, subtotal: item.price * ((item.quantity || 0) + 1) } : item
    );
    let rollback;

    if (isLoggedIn) {
      rollback = optimisticUpdate(
        () => setCartData({ items: updatedItems }),
        () => setCartData({ items: prevItems })
      );

      try {
        await cartService.increment(product_id);
        await refetchCart(); // ✅ FIX: Refetch full
        rollback = null;
      } catch (error) {
        rollback();
        console.error('Lỗi increment:', error);
        toast.error("Cập nhật số lượng thất bại");
      }
    } else {
      localCart.incrementQuantity(product_id);
      setCartData({ items: updatedItems });
    }
  };

  // ✅ decrement: Optimistic + API + refetch
  const decrement = async (product_id) => {
    const prevItems = cartData.items || [];
    const updatedItems = prevItems.map(item =>
      item.product_id === product_id && (item.quantity || 0) > 1
        ? { ...item, quantity: (item.quantity || 0) - 1, subtotal: item.price * ((item.quantity || 0) - 1) }
        : item
    ).filter(item => item.product_id !== product_id || (item.quantity || 0) > 0);
    let rollback;

    if (isLoggedIn) {
      rollback = optimisticUpdate(
        () => setCartData({ items: updatedItems }),
        () => setCartData({ items: prevItems })
      );

      try {
        await cartService.decrement(product_id);
        await refetchCart(); // ✅ FIX: Refetch full
        rollback = null;
      } catch (error) {
        rollback();
        console.error('Lỗi decrement:', error);
        toast.error("Cập nhật số lượng thất bại");
      }
    } else {
      localCart.decrementQuantity(product_id);
      setCartData({ items: updatedItems });
    }
  };

  return (
    <CartContext.Provider
      value={{
        isLoading,
        cartData,
        setCartData,
        addItem,
        deleteItem,
        increment,
        decrement,
        cartTotal,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { CartProvider, useCart };