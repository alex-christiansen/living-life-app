import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuthorization, setCheckingAuthorization] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (user) {
        try {
          const userRef = doc(db, "allowedUsers", user.email);
          const userDoc = await getDoc(userRef);

          // Set authorization based on whether the user exists in Firestore
          setIsAuthorized(userDoc.exists());
        } catch (error) {
          console.error("Error checking authorization:", error);
        }
      }
      setCheckingAuthorization(false); // Stop checking regardless of the result
    };

    if (user) {
      checkAuthorization();
    } else {
      setCheckingAuthorization(false);
    }
  }, [user]);

  if (loading || checkingAuthorization) {
    return <h1>Loading...</h1>; // Show a loading spinner while verifying auth
  }

  if (!user || !isAuthorized) {
    return <Navigate to="/" />; // Redirect to public landing page if unauthorized
  }

  return children;
};

export default ProtectedRoute;
