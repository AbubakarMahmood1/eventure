import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Input, Modal } from "rizzui";
import { useUser } from "@clerk/clerk-react";
import BookingPageSkeleton from "../Skeleton/BookingPageSkeleton";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { FiMinus, FiPlus, FiCalendar, FiMapPin, FiTag } from "react-icons/fi";
import { useQuery, useMutation } from "@tanstack/react-query";
import CheckoutForm from "../components/CheckoutForm";
const getCategoryColor = (category) => {
  if (!category) return "bg-gray-100 text-gray-800";

  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("music")) return "bg-purple-100 text-purple-800";
  if (categoryLower.includes("tech")) return "bg-blue-100 text-blue-800";
  if (categoryLower.includes("food")) return "bg-orange-100 text-orange-800";
  if (categoryLower.includes("health")) return "bg-green-100 text-green-800";
  if (categoryLower.includes("sport")) return "bg-red-100 text-red-800";

  return "bg-indigo-100 text-indigo-800";
};

const IMAGES = {
  music:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  food: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  technology:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  health:
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  sports:
    "https://plus.unsplash.com/premium_photo-1684820878202-52781d8e0ea9?q=80&w=3871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};
const addBooking = async (bookingData) => {
  console.log("booking data", bookingData);
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/add-booking`,
    {
      ...bookingData,
    }
  );
  console.log("Booking API Response:", response.data);
  return response.data;
};
const getEvent = async (id) => {
  console.log("getEvent called with ID:", id);

  if (!id) {
    throw new Error("Event ID is required");
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/get-event`,
      {
        params: { id },
      }
    );
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

function BookingPage() {
  const { user } = useUser();
  const stripePromise = loadStripe(
    "pk_test_51RCuzmCl0vn8AzTFhopPduTWVQlYArGSJl9TU0yEMRrCltDmOukj0oj4tObkzOw4PMfjgbEK6LU7yhlDEyUX5dnx00GXqqwZN5"
  ); // Use your publishable key
  const addEventMutation = useMutation({
    mutationFn: (bookingData) => addBooking(bookingData),
    onSuccess: (data) => console.log("Booking successful:", data),
    onError: (error) => console.error("Booking error:", error),
  });
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isCheckoutForm, setIsCheckoutForm] = useState(false);
  // Form state
  const [ticketCount, setTicketCount] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
  });

  // Modal state
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false);

  // React Query with proper configuration
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["singleevent", eventId], // queryKey should come first
    queryFn: () => getEvent(eventId),
    enabled: !!eventId, // Only run query if eventId exists
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log("Component render - eventId:", eventId);
  console.log(
    "Query state - isLoading:",
    isLoading,
    "data:",
    data,
    "error:",
    error
  );

  // Handle loading state
  if (isLoading) {
    return <BookingPageSkeleton />;
  }

  // Handle error state
  if (isError) {
    console.error("Query error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error loading event
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "Failed to load event details"}
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-purple-600 text-white"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Handle case where event data is not found
  if (!data || !data.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Event not found
          </h2>
          <Button
            onClick={() => navigate("/")}
            className="bg-purple-600 text-white"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Use the fetched event data
  const event = data.event;
  const totalPrice = (parseFloat(event.price) * ticketCount).toFixed(2);

  const handleDecreaseTickets = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const handleIncreaseTickets = () => {
    setTicketCount(ticketCount + 1);
  };

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
    };
    let isValid = true;

    if (!name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email address is invalid";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCheckout = () => {
    if (validateForm()) {
      const bookingDetails = {
        name,
        email: user.emailAddresses[0].emailAddress,
        quantity: ticketCount,
        totalPrice,
        eventId: event.id,
        eventTitle: event.title,
      };
      console.log("Booking Details for API:", bookingDetails);
      setIsCheckoutForm(true);
      // setIsThankYouModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsThankYouModalOpen(false);
    navigate("/");
  };
  const handlePaymebntSuccess = () => {
    console.log("Payment successful");
    const bookingDetails = {
      name,
      email: user.emailAddresses[0].emailAddress,
      quantity: ticketCount,
      totalPrice,
      eventId,
      eventTitle: event.title,
    };
    console.log("Booking Details for API:", bookingDetails);
    addEventMutation.mutate(bookingDetails);
    setIsCheckoutForm(false);
    setIsThankYouModalOpen(true);
  };
  const categoryColorClass = getCategoryColor(event.selectedCategory["value"]);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event Hero Section */}
      <div
        className="w-full h-64 sm:h-80 md:h-96 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${
            IMAGES[event.selectedCategory["value"]] ||
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"
          })`,
        }}
      >
        <div className="container mx-auto h-full flex flex-col justify-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center text-white text-opacity-90">
            <div className="flex items-center mr-6 mb-2">
              <FiCalendar className="mr-2" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center mr-6 mb-2">
              <FiMapPin className="mr-2" />
              <span>{event.location}</span>
            </div>
            {event.selectedCategory["value"] && (
              <div className="flex items-center mb-2">
                <FiTag className="mr-2" />
                <span>{event.selectedCategory.label}</span>
                {/* <span>here is cat</span> */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Event Details */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">About this event</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <FiCalendar className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Date</h3>
                    <p className="text-gray-600">{event.date}</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <FiMapPin className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-3 ${categoryColorClass}`}
                  >
                    <FiTag
                      className={
                        categoryColorClass.includes("text-")
                          ? categoryColorClass.split(" ")[1]
                          : "text-gray-600"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-medium">
                      {event.selectedCategory["label"] || "Uncategorized"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Book Tickets</h2>

              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-medium">Ticket Price</h3>
                    <p className="text-purple-700 font-bold">
                      ${event.price} each
                    </p>
                  </div>

                  <div className="flex items-center">
                    <button
                      onClick={handleDecreaseTickets}
                      className="bg-white rounded-l-md p-2 border border-gray-300 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus />
                    </button>
                    <div className="w-12 text-center py-2 border-t border-b border-gray-300">
                      {ticketCount}
                    </div>
                    <button
                      onClick={handleIncreaseTickets}
                      className="bg-white rounded-r-md p-2 border border-gray-300 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span className="text-xl text-purple-700">${totalPrice}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <Modal
                  size="lg"
                  isOpen={isCheckoutForm}
                  onClose={() => setIsCheckoutForm(false)}
                >
                  <div>
                    <Elements stripe={stripePromise}>
                      <CheckoutForm
                        totalPrice={Number(totalPrice)}
                        onSuccess={handlePaymebntSuccess}
                      />
                    </Elements>
                  </div>
                </Modal>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              <button
                onClick={() => navigate("/")}
                className="w-full text-center mt-4 text-purple-600 hover:underline"
              >
                Return to events
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      <Modal isOpen={isThankYouModalOpen} onClose={handleCloseModal} size="md">
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Booking Confirmed!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for booking tickets to {event.title}. We've sent a
            confirmation email with all the details.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Event:</span>
              <span className="font-medium">{event.title}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{event.date}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tickets:</span>
              <span className="font-medium">{ticketCount}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-800 font-bold">Total paid:</span>
              <span className="text-purple-700 font-bold">${totalPrice}</span>
            </div>
          </div>

          <Button className="bg-purple-600 w-full" onClick={handleCloseModal}>
            Return to Homepage
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default BookingPage;
