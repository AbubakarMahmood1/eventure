import { useUser } from "@clerk/clerk-react";
import { useClerk } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children }) {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  if (!isSignedIn) {
    openSignIn();
    return <Navigate to="/" />;
  }
  return children;
}
