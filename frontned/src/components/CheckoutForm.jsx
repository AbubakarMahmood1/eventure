// CheckoutForm.js
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import axios from "axios";
const CheckoutForm = ({ totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe is not loaded. Please try again later.");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/create-payment-intent`,
        {
          amount: totalPrice * 100, // $10.00 in cents
        }
      );

      const { clientSecret } = res.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setMessage(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        setMessage("💸 Payment succeeded!");
        onSuccess();
      } else {
        setMessage("⚠️ Payment processing...");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }

    setIsProcessing(false);
  };
  console.log(totalPrice);
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 shadow-lg rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Secure Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Card Information
          </label>
          <div className="p-3 border border-gray-300 rounded-md shadow-sm">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#c0392b",
                  },
                },
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isProcessing ? "Processing..." : `Pay $${totalPrice}`}
        </button>

        {message && (
          <div
            className={`text-center mt-4 text-sm font-medium ${
              message.includes("succeeded") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
