import { Badge, TableCell } from "@windmill/react-ui";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "helpers/formatCurrency";

const OrderItem = ({ order }) => {
  const orderRef = order.ref || order.id || order.order_id || "Not available";
  return (
    <>
      <TableCell>#{order.order_id}</TableCell>
      <TableCell>{orderRef || "Not available"}</TableCell>
      <TableCell>
        <Badge type={order.status === 'completed' ? "success" : order.status === 'delivery' ? "warning" : order.status === 'preparing' ? "info" : "danger"}>
          {order.status}
        </Badge>{" "}
      </TableCell>
      <TableCell>{formatCurrency(order.amount)}</TableCell>
      <TableCell>{format(parseISO(order.date), "dd/MM/yy")}</TableCell>
    </>
  );
};

export default OrderItem;