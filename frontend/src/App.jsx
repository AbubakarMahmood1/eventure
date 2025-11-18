import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import ProtectedRoute from "./pages/ProtectedRoute";

import HomePage from "./pages/HomePage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import "./App.css";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/book/:eventId" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
