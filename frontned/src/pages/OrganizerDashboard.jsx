import { useState } from "react";
import {
  Button,
  Select,
  Badge,
  Modal,
  Input,
  Textarea,
  ActionIcon,
} from "rizzui";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { eventData } from "../data/mockData";
import { useUser } from "@clerk/clerk-react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
  FiTag,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";
import EventTableSkeleton from "../Skeleton/EventTableSkeleton";
import ErrorState from "../components/ErrorState";
import EventsNotFoundState from "../components/EventsNotFoundState";
const addEvent = async (eventData) => {
  console.log(eventData);
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/add-event`,
    eventData
  );
  return response.data;
};
const getEvents = async (email) => {
  console.log(email);
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/get-events`,
    {
      params: {
        email: email,
      },
    }
  );
  return response.data;
};
const getBookings = async (email) => {
  console.log(email);
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/get-bookings`,
    {
      params: {
        email: email,
      },
    }
  );

  return response.data.bookings;
};
const deleteEvent = async (id) => {
  console.log(id);
  const response = await axios.delete(
    `${import.meta.env.VITE_API_BASE_URL}/delete-event`,
    {
      params: {
        id,
      },
    }
  );
  return response.data;
};
const updateEvent = async (data) => {
  console.log(data);
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/update-event`,
    {
      params: {
        data,
      },
    }
  );
  return response.data;
};
function OrganizerDashboard() {
  const categoryOptions = [
    { label: "Music", value: "music" },
    { label: "Technology", value: "technology" },
    { label: "Food & Drink", value: "food" },
    { label: "Health", value: "health" },
    { label: "Sports", value: "sports" },
  ];
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
  const { user } = useUser();
  const [events, setEvents] = useState(eventData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("events");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    image: "",
  });
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
  });
  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryFn: () => getEvents(user.emailAddresses[0].emailAddress),
    queryKey: ["events", user.emailAddresses[0].emailAddress],
    enabled: !!user?.emailAddresses?.[0]?.emailAddress,
  });
  const {
    data: allBookingsData,
    isLoading: allBookingsLoading,
    error: allBookingsError,
  } = useQuery({
    queryFn: () => getBookings(user.emailAddresses[0].emailAddress),
    queryKey: ["allBookings"],
    enabled: !!user?.emailAddresses?.[0]?.emailAddress,
  });
  if (!allBookingsLoading) {
    console.log(allBookingsData);
  }
  const updateEventMutation = useMutation({
    mutationFn: (data) => updateEvent(data),
    onSuccess: () => {
      console.log("Event updated successfully");

      refetch();
    },
    onError: () => {
      console.log("please try later");
    },
  });
  const mutation = useMutation({
    mutationFn: (data) => {
      setIsSubmitting(true);
      return addEvent(data);
    },
    onSuccess: (data) => {
      console.log(data);
      refetch();
    },
    onError: (err) => {
      console.log(err);
    },
    onSettled: () => {
      setIsCreateModalOpen(false);
      setIsSubmitting(false);
    },
  });
  const handleDeleteMutation = useMutation({
    mutationFn: (id) => {
      return deleteEvent(id);
    },
    onSuccess: (data) => {
      console.log(data);
      refetch();
    },
    onError: (err) => {
      console.log(err);
    },
  });
  const handleDelete = (id) => {
    handleDeleteMutation.mutate(id);

    // setEvents(events.filter((event) => event.id !== id));
  };

  const handleEdit = (event) => {
    console.log(event);
    setCurrentEvent(event);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    updateEventMutation.mutate(currentEvent);
    console.log(currentEvent);
    console.log("this run");

    // setEvents(events.map((e) => (e.id === currentEvent.id ? currentEvent : e)));
    setIsEditModalOpen(false);
  };

  const handleCreateEvent = () => {
    // Reset previous errors
    const errors = {
      title: "",
      description: "",
      date: "",
      location: "",
      price: "",
    };

    // Validate required fields
    if (!newEvent.title.trim()) errors.title = "Event title is required";
    if (!newEvent.description.trim())
      errors.description = "Description is required";
    if (!newEvent.date) errors.date = "Date is required";
    if (!newEvent.location.trim()) errors.location = "Location is required";
    if (!newEvent.price) errors.price = "Price is required";

    // Update error state
    setFormErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error);

    // Log the form data for API integration

    // Only proceed if no errors
    if (!hasErrors) {
      // Log successful submission data
      console.log("Creating event with data:", {
        ...newEvent,
        id: Math.max(...events.map((e) => e.id)) + 1,
        attendees: 0,
      });

      mutation.mutate({
        ...newEvent,
        selectedCategory,
        email: user.emailAddresses[0].emailAddress,
      });
      const id = Math.max(...events.map((e) => e.id)) + 1;
      setEvents([...events, { ...newEvent, id, attendees: 0 }]);
      // setIsCreateModalOpen(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        location: "",
        price: "",
        image: "",
      });
    }
  };
  if (allBookingsError) {
    console.log(allBookingsError);
  }
  const viewBookingDetails = (booking) => {
    setSelectedBooking({ ...booking });
    setIsBookingDetailOpen(true);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Event Organizer Dashboard
            </h1>
            <Link to="/" className="text-purple-600 hover:underline">
              Back to Homepage
            </Link>
          </div>
          <Button
            className="bg-purple-600 text-white flex items-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus /> Create Event
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Custom Tab Navigation */}
          <div className="border-b mb-6">
            <div className="flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "events"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("events")}
              >
                Your Events
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("bookings")}
              >
                Your Bookings
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "events" && (
            <>
              <h2 className="text-xl font-semibold mb-6">Your Events</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Event Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Attendees
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <EventTableSkeleton />
                    ) : error ? (
                      <ErrorState type="Events" />
                    ) : eventsData && eventsData.data.length > 0 ? (
                      eventsData.data.map((event) => (
                        <tr key={event._id} className="border-t">
                          <td className="px-4 py-3 text-sm font-medium">
                            {event.title}
                          </td>
                          <td className="px-4 py-3 text-sm">{event.date}</td>
                          <td className="px-4 py-3 text-sm">
                            {event.selectedCategory.label}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {event.location}
                          </td>
                          <td className="px-4 py-3 text-sm">${event.price}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="flat" color="success">
                              {event.attandees} registered
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <ActionIcon
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(event)}
                              >
                                <FiEdit />
                              </ActionIcon>
                              <ActionIcon
                                variant="outline"
                                size="sm"
                                color="danger"
                                onClick={() => handleDelete(event._id)}
                              >
                                <FiTrash2 />
                              </ActionIcon>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <EventsNotFoundState type="events" />
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "bookings" && (
            <>
              <h2 className="text-xl font-semibold mb-6">Your Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Event Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookingsLoading ? (
                      <EventTableSkeleton />
                    ) : allBookingsError ? (
                      <ErrorState type="bookings" />
                    ) : allBookingsData && allBookingsData.length > 0 ? (
                      allBookingsData.map((event) => (
                        <tr key={event._id} className="border-t">
                          <td className="px-4 py-3 text-sm font-medium">
                            {event.eventTitle}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {event.eventId.date}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {event.eventId.location}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            ${event.totalPrice}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="flat">{event.quantity}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-600 text-purple-600 hover:bg-purple-50"
                              onClick={() => viewBookingDetails(event)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <EventsNotFoundState type="bookings" />
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Create Event Modal with Red Error Messages */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Event</h3>
          <div className="space-y-4">
            <div>
              <Input
                label="Event Title"
                placeholder="Enter event name"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>
            <div>
              <Select
                label="Select Category"
                value={selectedCategory}
                options={categoryOptions}
                onChange={setSelectedCategory}
              />
            </div>
            <div>
              <Textarea
                label="Description"
                placeholder="Event description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
                {formErrors.date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                )}
              </div>
              <div>
                <Input
                  label="Location"
                  placeholder="Event location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.location}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Price ($)"
                  type="number"
                  value={newEvent.price}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, price: e.target.value })
                  }
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.price}
                  </p>
                )}
              </div>
              <div>
                <Input
                  label="Image URL (optional)"
                  placeholder="Event image URL"
                  value={newEvent.image}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, image: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600"
                onClick={handleCreateEvent}
                isLoading={isSubmitting}
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Event Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        {currentEvent && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Edit Event</h3>
            <div className="space-y-4">
              <Input
                label="Event Title"
                placeholder="Enter event name"
                value={currentEvent.title}
                onChange={(e) =>
                  setCurrentEvent({ ...currentEvent, title: e.target.value })
                }
              />
              <Textarea
                label="Description"
                placeholder="Event description"
                value={currentEvent.description}
                onChange={(e) =>
                  setCurrentEvent({
                    ...currentEvent,
                    description: e.target.value,
                  })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={currentEvent.date}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, date: e.target.value })
                  }
                />
                <Input
                  label="Location"
                  placeholder="Event location"
                  value={currentEvent.location}
                  onChange={(e) =>
                    setCurrentEvent({
                      ...currentEvent,
                      location: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price ($)"
                  type="number"
                  value={currentEvent.price}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, price: e.target.value })
                  }
                />
                <Input
                  label="Image URL"
                  placeholder="Event image URL"
                  value={currentEvent.image}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, image: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-purple-600" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Booking Details Modal */}
      <Modal
        isOpen={isBookingDetailOpen}
        onClose={() => setIsBookingDetailOpen(false)}
        size="lg"
      >
        {selectedBooking && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {selectedBooking.eventTitle}
              </h3>
              <button
                onClick={() => setIsBookingDetailOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FiCalendar className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">
                      {selectedBooking.eventId.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FiMapPin className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">
                      {selectedBooking.eventId.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FiDollarSign className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-medium">${selectedBooking.totalPrice}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FiTag className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedBooking.eventId.selectedCategory.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-2">Booking Status</h4>
              <Badge size="lg" variant="flat">
                Confirmed
              </Badge>
            </div>

            {selectedBooking && (
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-2">
                  Event Description
                </h4>
                <p className="text-gray-600">
                  {selectedBooking.eventId.description}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => setIsBookingDetailOpen(false)}
              >
                Close
              </Button>
              <Button className="bg-purple-600 text-white">
                Download Ticket
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OrganizerDashboard;
