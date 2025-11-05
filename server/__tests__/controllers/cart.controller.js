const user_id = req.user?.user_id || req.user?.id;
let { product_id, quantity } = req.body;
product_id = Number(product_id);
quantity = Number(quantity) || 1;

if (!user_id || !product_id) {
  throw new ErrorHandler(400, "Thiếu user_id hoặc product_id");
}
console.log("DEBUG addItem:", { user: req.user, body: req.body });
