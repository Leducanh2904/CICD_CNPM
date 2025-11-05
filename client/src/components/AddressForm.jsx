import { Button, HelperText, Input, Label } from "@windmill/react-ui";
import { useUser } from "context/UserContext";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AddressForm = ({ next }) => {
  const { userData } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullname: userData?.fullname,
      email: userData?.email,
      address: userData?.address,
      country: userData?.country,
      city: userData?.city,
      state: userData?.state,
    },
  });

  const onSubmit = (data) => {
    if (!data.address || data.address.length < 5) {
      toast.error("Địa chỉ phải chi tiết");
      return;
    }
    next(data);  // Gửi {fullname, email, address, country, city, state}
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl text-center mb-4 font-semibold">Address Details</h1>
      <form
        className="border p-4 border-black-4 w-full md:w-1/2 mx-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Label className="block text-grey-darker text-sm font-bold mb-4">
          <span>Fullname</span>
          <Input
            disabled
            type="text"
            className="shadow appearance-none rounded w-full text-grey-darker mt-2 px-2 py-2 border focus:outline-none"
            {...register("fullname", { required: "Required" })}
          />
          {errors.fullname && <HelperText valid={false}>{errors.fullname.message}</HelperText>}
        </Label>
        <Label className="block text-grey-darker text-sm font-bold mb-4">
          <span>Email</span>
          <Input
            disabled
            className="shadow appearance-none rounded w-full text-grey-darker mt-2 px-2 py-2 border focus:outline-none"
            type="text"
            {...register("email", { required: "Required" })}
          />
          {errors.email && <HelperText valid={false}>{errors.email.message}</HelperText>}
        </Label>
        <Label className="block text-grey-darker text-sm font-bold mb-4">
          <span>Address</span>
          <Input
            className="shadow appearance-none rounded w-full text-grey-darker mt-2 px-2 py-2 border focus:outline-none"
            type="text"
            {...register("address", { required: "Required" })}
          />
          {errors.address && <HelperText valid={false}>{errors.address.message}</HelperText>}
        </Label>
        <Label className="block text-grey-darker text-sm font-bold mb-4">
          <span>Country</span>
          <Input
            className="shadow appearance-none rounded w-full text-grey-darker mt-2 px-2 py-2 border focus:outline-none"
            type="text"
            {...register("country", { required: "Required" })}
          />
          {errors.country && <HelperText valid={false}>{errors.country.message}</HelperText>}
        </Label>
        <Label className="block text-grey-darker text-sm font-bold mb-4">
          <span>State/Region</span>
          <Input
            className="shadow appearance-none rounded w-full text-grey-darker mt-2 px-2 py-2 border focus:outline-none"
            type="text"
            {...register("state", { required: "Required" })}
          />
          {errors.state && <HelperText valid={false}>{errors.state.message}</HelperText>}
        </Label>
        <Label className="block text-grey-darker text-sm font-bold mb-4">
          <span>City</span>
          <Input
            className="shadow appearance-none rounded w-full text-grey-darker mt-2 px-2 py-2 border focus:outline-none"
            type="text"
            {...register("city", { required: "Required" })}
          />
          {errors.city && <HelperText valid={false}>{errors.city.message}</HelperText>}
        </Label>
        <div className="flex justify-between">
          <Button tag={Link} to="/cart" layout="outline" size="small">
            Back to cart
          </Button>
          <Button type="submit" size="small">
            Proceed
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;