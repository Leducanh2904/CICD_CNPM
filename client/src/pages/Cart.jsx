import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from "@windmill/react-ui";
import CartItem from "components/CartItem";
import { useCart } from "context/CartContext";
import { useUser } from "context/UserContext";
import { formatCurrency } from "helpers/formatCurrency";
import Layout from "layout/Layout";
import { ShoppingCart } from "react-feather";
import { Link } from "react-router-dom";
import { useEffect } from "react";  // Để refetch
import cartService from "services/cart.service";  // Để gọi getCart

const Cart = () => {
  const { cartData, isLoading, setCartData, cartSubtotal } = useCart();
  const { isLoggedIn } = useUser();

  // ✅ FIX: Refetch cart khi mount page (sau add item, navigate sang) - Bỏ setIsLoading vì không export
  useEffect(() => {
    const refetchCart = async () => {
      if (isLoggedIn) {  // Luôn refetch nếu logged in (không phụ thuộc empty)
        console.log('🔍 Refetching cart on mount...');  // Log debug tạm
        try {
          const res = await cartService.getCart();
          console.log('🔍 Refetch res:', res?.data?.items?.length);  // Log items
          setCartData(res?.data || { items: [] });
        } catch (error) {
          console.error('Refetch cart error:', error);
        }
      }
    };
    refetchCart();
  }, []);  // Deps []: Chỉ chạy 1 lần khi mount

  if (!isLoggedIn) {
    return (
      <Layout title="Cart" loading={false}>  
        <h1 className="my-10 text-center text-4xl font-semibold">Shopping Cart</h1>
        <div className="h-full flex flex-col justify-center items-center">
          <ShoppingCart size={150} />
          <p>Vui lòng đăng nhập để xem giỏ hàng.</p>
          <Button tag={Link} to="/login">
            Đăng nhập
          </Button>
        </div>
      </Layout>
    );
  }

  // ✅ THÊM LOG DEBUG TẠM (xóa sau)
  console.log('🔍 Cart render:', { 
    itemsLength: cartData?.items?.length, 
    isLoading, 
    subtotal: cartSubtotal,
    cartData 
  });

  // ✅ FIX NaN: Nếu subtotal NaN, fallback 0
  const safeSubtotal = isNaN(cartSubtotal) ? 0 : cartSubtotal;

  if (cartData?.items?.length === 0 || isLoading || cartData === undefined) {
    return (
      <Layout title="Cart" loading={isLoading || cartData === undefined}>
        <h1 className="my-10 text-center text-4xl font-semibold">Shopping Cart</h1>
        <div className="h-full flex flex-col justify-end items-center">
          <ShoppingCart size={150} />
          <p>{isLoading ? 'Đang tải giỏ hàng...' : 'Giỏ hàng trống'}</p>
          {!isLoading && (
            <Button tag={Link} to="/">
              Tiếp tục mua sắm
            </Button>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout loading={isLoading || cartData === undefined}>
      <h1 className="my-10 text-center text-4xl font-semibold">Shopping Cart</h1>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Remove</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartData?.items?.map((item) => (
              <TableRow key={item.product_id || item.id}>
                <CartItem item={item} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter className="flex flex-col justify-end items-end">
          <div className="mb-2">Total: {formatCurrency(safeSubtotal)}</div>
          <Button
            tag={Link}
            to={"/cart/checkout"}
            state={{
              fromCartPage: true,
            }}
          >
            Checkout
          </Button>
        </TableFooter>
      </TableContainer>
    </Layout>
  );
};

export default Cart;