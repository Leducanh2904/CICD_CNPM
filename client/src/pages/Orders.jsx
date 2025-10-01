import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from "@windmill/react-ui";
import OrderItem from "components/OrderItem";
import { useOrders } from "context/OrderContext";
import { useUser } from "context/UserContext";  // Thêm dòng này
import Layout from "layout/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "services/order.service";

const Orders = () => {
  const { orders, setOrders } = useOrders();
  const { isLoggedIn } = useUser();  // Thêm: Check login
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(true);  // Thêm: Local loading
  const navigate = useNavigate();

  const handlePage = (num) => {
    setCurrentPage(num);
  };

  const goToDetails = (order) => {
    navigate(`/orders/${order.order_id}`, { state: { order } });
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setIsFetching(false);
      return;
    }

    const fetchOrders = async () => {
      setIsFetching(true);
      try {
        const res = await orderService.getAllOrders(currentPage);
        setOrders(res.data || { items: [], total: 0 });  // Set default nếu empty
      } catch (error) {
        console.error('Lỗi fetch orders:', error);  // Log để debug
        setOrders({ items: [], total: 0 });  // Set empty nếu error
      } finally {
        setIsFetching(false);  // Luôn tắt loading
      }
    };

    fetchOrders();
  }, [currentPage, isLoggedIn, setOrders]);

  if (!isLoggedIn) {
    return (
      <Layout loading={true}>
        <h1 className="my-10 text-center text-4xl font-semibold">Orders</h1>
        <p>Vui lòng đăng nhập để xem đơn hàng.</p>
      </Layout>
    );
  }

  if (orders?.items?.length === 0 || isFetching) {
    return (
      <Layout loading={isFetching}>
        <h1 className="my-10 text-center text-4xl font-semibold">Orders</h1>
        <p>{isFetching ? 'Đang tải đơn hàng...' : 'Bạn chưa có đơn hàng nào'}</p>
      </Layout>
    );
  }

  return (
    <Layout title="Orders" loading={isFetching}>
      <h1 className="my-10 text-center text-4xl font-semibold">Orders</h1>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>No. of items</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.items.map((order) => (
              <TableRow
                className="cursor-pointer"
                onClick={() => goToDetails(order)}
                key={order.order_id}
              >
                <OrderItem order={order} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={orders?.total}
            resultsPerPage={5}
            onChange={handlePage}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </Layout>
  );
};

export default Orders;