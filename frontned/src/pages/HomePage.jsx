import { Button, Input, MultiSelect, Modal } from "rizzui";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useClerk } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventCardSkeleton from "../Skeleton/EventCardSkeleton";
import axios from "axios";
import ErrorState from "../components/ErrorState";
import EventsNotFoundState from "../components/EventsNotFoundState";
import {
  FiSearch,
  FiCalendar,
  FiMapPin,
  FiMusic,
  FiCode,
  FiCoffee,
  FiHeart,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import EventCard from "../components/EventCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useQuery } from "@tanstack/react-query";
// https://eventure-backend-sigma.vercel.app/api/get-all-events
const getAllEvents = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/get-all-events`,
    {
      timeout: 5000,
    }
  );
  return response.data.events;
};
const getFeaturedEvents = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/get-featured-events`
  );
  return response.data.events;
};
const getUpcomingEvents = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/get-upcoming-events`
  );
  return response.data.events;
};

const categories = [
  { label: "Music", value: "music" },
  { label: "Technology", value: "technology" },
  { label: "Food & Drink", value: "food" },
  { label: "Health", value: "health" },
  { label: "Sports", value: "sports" },
];
const howItWorks = [
  {
    step: 1,
    title: "Find Events",
    description: "Search for events that match your interests",
    icon: <FiSearch size={36} />,
  },
  {
    step: 2,
    title: "Book Tickets",
    description: "Select your seats and make payment securely",
    icon: <FiCalendar size={36} />,
  },
  {
    step: 3,
    title: "Get Confirmation",
    description: "Receive your e-ticket via email instantly",
    icon: <FiMapPin size={36} />,
  },
  {
    step: 4,
    title: "Enjoy the Event",
    description: "Show up and have an amazing experience",
    icon: <FiHeart size={36} />,
  },
];

function HomePage() {
  const {
    data: featuredEventsData,
    isLoading,
    error: featuredEventsError,
  } = useQuery({
    queryFn: getFeaturedEvents,
    queryKey: ["featuredEvents"],
  });
  const {
    data: upcomingEventsData,
    isLoading: upcomingEventsIsLoading,
    error: upcomingEventsError,
  } = useQuery({
    queryFn: getUpcomingEvents,
    queryKey: ["upcomingEvents"],
  });

  const clerk = useClerk();
  // const { user } = useUser();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Single modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  // Format categories for MultiSelect
  // const categoryOptions = categories.map((category) => ({
  //   value: category.name.toLowerCase(),
  //   label: category.name,
  // }));

  const {
    data: alleventsData,
    isLoading: alleventsDataIsLoading,
    error: allEventsError,
  } = useQuery({
    queryFn: getAllEvents,
    queryKey: ["all_OfTheEvents"],
  });
  const handleBrowseEvents = () => {
    setModalTitle("Browse All Events");
    setSelectedCategories([]);
    setSelectedDate("");
    setSelectedLocation("");
    setFilteredEvents(alleventsData || []);
    setIsModalOpen(true);
  };
  useEffect(() => {
    setFilteredEvents(alleventsData);
  }, [alleventsData]);
  // Handle search with filters
  const handleSearchEvents = () => {
    setModalTitle("Search Results");
    let filtered = alleventsData || [];
    if (selectedCategories.length > 0) {
      console.log(selectedDate);
      filtered = filtered.filter((event) => {
        return selectedCategories.includes(event.selectedCategory.value);
      });
    }
    if (selectedDate !== "") {
      filtered = filtered.filter((event) => selectedDate === event.date);
    }
    if (selectedLocation.length > 0) {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
    setIsModalOpen(true);
  };

  // Remove a category filter and update results
  const removeCategory = (cat) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== cat));
  };

  // Clear date filter
  const clearDateFilter = () => {
    // setSelectedCategories([]);
    // setFilteredEvents(alleventsData);
    handleSearchEvents();
    setSelectedDate("");
  };

  // Clear location filter
  const clearLocationFilter = () => {
    setSelectedLocation("");
  };

  // Get filtered events based on current filter state
  // const filteredEvents = getFilteredEvents();

  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling down 100px
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Sticky Header - Enhanced Glassmorphism */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/30 shadow-lg shadow-white/10 border-b border-white/10 transition-all duration-300 ${
          isScrolled ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center backdrop-saturate-150">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
                Eventure
              </span>
            </h1>
          </Link>
          <div className="flex gap-3">
            <SignedOut>
              <Button className="bg-white" onClick={() => clerk.openSignIn()}>
                Login
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-100">
                Eventure
              </span>
            </h1>
            <div className="flex gap-3">
              <SignedOut>
                <Button
                  className="border-white text-white hover:bg-white hover:bg-opacity-10"
                  onClick={() => clerk.openSignIn()}
                >
                  Get Started
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover Events Near You
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Find and book tickets to the most exciting events happening in
              your area
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-100"
                onClick={handleBrowseEvents}
              >
                Browse Events
              </Button>
              <Link to="/organizer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:bg-opacity-10"
                >
                  Create Event
                </Button>
              </Link>
            </div>

            {/* Search Bar - Updated with MultiSelect */}
            <div className="bg-white rounded-lg p-4 shadow-lg max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="z-20">
                  <MultiSelect
                    options={categories}
                    value={selectedCategories}
                    placeholder="Select categories"
                    className="w-full text-black"
                    onChange={setSelectedCategories}
                  />
                </div>
                <div className="flex items-center bg-gray-50 rounded px-3 border border-gray-200">
                  <FiCalendar className="text-gray-500 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    className="w-full py-2 px-1 bg-transparent outline-none border-none text-black"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center bg-gray-50 rounded px-3 border border-gray-200">
                  <FiMapPin className="text-gray-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full py-2 px-1 bg-transparent outline-none border-none text-black"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </div>
              </div>
              <Button
                size="lg"
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600"
                onClick={handleSearchEvents}
              >
                Search Events
              </Button>
            </div>
            {/* End Search Bar */}
          </div>
        </div>
      </section>

      {/* Featured Events Section - Improved with Swiper */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Featured Events
          </h2>

          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="featured-events-swiper"
            >
              {isLoading ? (
                [1, 2, 3].map((e) => <EventCardSkeleton key={e} />)
              ) : featuredEventsError ? (
                <ErrorState type="Events" />
              ) : featuredEventsData && featuredEventsData.length > 0 ? (
                featuredEventsData.map((event) => (
                  <SwiperSlide key={event.id}>
                    <div className="pb-10">
                      <EventCard event={event} />
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <EventsNotFoundState type="No featured events" />
              )}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Categories Section */}

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Upcoming Events
          </h2>
          {upcomingEventsIsLoading ? (
            [1, 2, 3].map((e) => <EventCardSkeleton key={e} />)
          ) : upcomingEventsError ? (
            <ErrorState type="Upcoming Events" />
          ) : upcomingEventsData && upcomingEventsData.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEventsData.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
              <div className="text-center m-12">
                <Button
                  size="lg"
                  className="bg-purple-600"
                  onClick={handleBrowseEvents}
                >
                  View All Events
                </Button>
              </div>
            </div>
          ) : (
            <EventsNotFoundState type="No upcoming events" />
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Step {item.step}: {item.title}
                </h3>
                <p className="opacity-80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Eventure</h3>
              <p className="text-gray-400">
                Discover, book, and enjoy events around you.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Pages</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaFacebook size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaTwitter size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaInstagram size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaLinkedin size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Eventure. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Events Modal - Used for both browsing and searching */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">{modalTitle}</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Filter controls in modal */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="z-10">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                <MultiSelect
                  options={categories}
                  value={selectedCategories}
                  placeholder="Select categories"
                  className="w-full text-black"
                  onChange={setSelectedCategories}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="flex items-center bg-white rounded px-3 border border-gray-200">
                  <FiCalendar className="text-gray-500 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    className="w-full py-2 px-1 bg-transparent outline-none border-none text-black"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="flex items-center bg-white rounded px-3 border border-gray-200">
                  <FiMapPin className="text-gray-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full py-2 px-1 bg-transparent outline-none border-none text-black"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                onClick={() => {
                  setFilteredEvents(alleventsData);
                  setSelectedCategories([]);
                  setSelectedDate("");
                  setSelectedLocation("");
                }}
                variant="outline"
                className="mr-2"
              >
                Clear Filters
              </Button>
              <Button
                className="bg-purple-600 text-white"
                onClick={handleSearchEvents}
              >
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Active filters display */}

          {(selectedCategories.length > 0 ||
            selectedDate ||
            selectedLocation) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedCategories.map((cat) => (
                <div
                  key={cat}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm"
                >
                  <span>
                    {categories.find((option) => option.value === cat)?.label}
                  </span>
                  <button className="ml-2" onClick={() => removeCategory(cat)}>
                    <FiX size={16} />
                  </button>
                </div>
              ))}
              {selectedDate && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm">
                  <span>Date: {selectedDate}</span>
                  <button className="ml-2" onClick={clearDateFilter}>
                    <FiX size={16} />
                  </button>
                </div>
              )}
              {selectedLocation && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm">
                  <span>Location: {selectedLocation}</span>
                  <button className="ml-2" onClick={clearLocationFilter}>
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
          {!alleventsDataIsLoading ? (
            allEventsError ? (
              <ErrorState type="Evetns" />
            ) : filteredEvents && filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <EventsNotFoundState type="No events" />
            )
          ) : (
            <EventCardSkeleton />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default HomePage;
