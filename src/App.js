import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./utils/firebaseConfig";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dinners from "./pages/Dinners";
import ProtectedRoute from "./components/ProtectedRoute";
import useInactivityLogout from "./hooks/useInactivityLogout";

// const Dinners = () => <h1>Dinners Page</h1>;
const Miles = () => <h1>Miles Page</h1>;
const Runs = () => <h1>Runs Page</h1>;

const App = () => {
  const [user, loading] = useAuthState(auth);
  useInactivityLogout(300000);
  
  if (loading) {
    return <h1>Loading...</h1>; // Show a loading spinner while checking auth state
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/landing" /> : <Login />}
        />
        <Route
          path="/landing"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dinners"
          element={
            <ProtectedRoute>
              <Dinners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/miles"
          element={
            <ProtectedRoute>
              <Miles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/runs"
          element={
            <ProtectedRoute>
              <Runs />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
