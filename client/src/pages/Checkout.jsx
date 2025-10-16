import AddressForm from "components/AddressForm";
import PaymentForm from "components/PaymentForm";
import { useCart } from "context/CartContext";
import { useUser } from "context/UserContext";  // Thêm
import Layout from "layout/Layout";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";  // Thêm

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [addressData, setAddressData] = useState();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartData } = useCart();
  const { isLoggedIn } = useUser();  // Thêm check login

  useEffect(() => {
    if (!state?.fromCartPage) {
      toast.error("Vui lòng từ giỏ hàng");
      return navigate("/cart");
    }

    if (cartData.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return navigate("/cart");
    }

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập");
      return navigate("/login");
    }
  }, [cartData, navigate, state, isLoggedIn]);

  const nextStep = () => setActiveStep((prevStep) => prevStep + 1);
  const previousStep = () => setActiveStep((prevStep) => prevStep - 1);

  const next = (data) => {
    setAddressData(data);
    nextStep();
  };
  return (
    <Layout>
      <div className="flex flex-col justify-center items-center mt-10">
        {activeStep === 0 ? (
          <AddressForm next={next} />
        ) : (
          <PaymentForm previousStep={previousStep} addressData={addressData} /> 
        )}
      </div>
    </Layout>
  );
};

export default Checkout;