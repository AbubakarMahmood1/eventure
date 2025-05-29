import { useState } from "react";
import { Button, Modal } from "rizzui";
import { useUser, useClerk } from "@clerk/clerk-react";
import { FiCalendar, FiMapPin, FiUsers, FiTag, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
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
function EventCard({ event }) {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [showDetails, setShowDetails] = useState(false);
  const categoryColorClass = getCategoryColor(event.selectedCategory["value"]);
  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className="h-48 overflow-hidden">
          <img
            src={
              IMAGES[event.selectedCategory["value"]] ||
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {event.title}
            </h3>
            <span className="text-purple-600 font-bold">${event.price}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <span className="mr-3">{event.date}</span>
            <span>{event.location}</span>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowDetails(true)}
              variant="outline"
              className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              View Details
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white"
              onClick={() => {
                !isSignedIn ? openSignIn() : navigate(`/book/${event._id}`);
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        size="lg"
      >
        <div className="p-0">
          <button
            onClick={() => setShowDetails(false)}
            className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Close"
          >
            <FiX size={20} className="text-gray-700" />
          </button>

          <div className="h-64 overflow-hidden">
            <img
              src={
                IMAGES[event.selectedCategory["value"]] ||
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              }
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {event.title}
              </h2>
              <span className="text-purple-600 text-xl font-bold">
                ${event.price}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FiCalendar className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FiMapPin className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">{event.location}</p>
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
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <FiUsers className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Attendees</p>
                    <p className="font-medium">{event.attandees}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About this event</h3>
              <p className="text-gray-600">{event.description}</p>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
              onClick={() =>
                !isSignedIn ? openSignIn() : navigate(`/book/${event._id}`)
              }
            >
              Book Now
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default EventCard;
