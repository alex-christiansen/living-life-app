import React from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Box, Typography } from "@mui/material";
import Lottie from "lottie-react";
import googleAnimation from "../animations/google-animation.json";

const Login = () => {
  const navigate = useNavigate();

  const checkUserAccess = async (email) => {
    try {
      const userRef = doc(db, "allowedUsers", email);
      const userDoc = await getDoc(userRef);
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user access:", error);
      return false;
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const isAllowed = await checkUserAccess(result.user.email);

      if (isAllowed) {
        console.log("User signed in");
        navigate("/landing"); // Redirect to the landing page
      } else {
        console.log("User not authorized");
        await signOut(auth);
        alert("You are not authorized to access this application.");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        position: "relative",
        background: "linear-gradient(135deg, #4285F4, #E3F2FD)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Floating Bubbles */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 80,
          height: 80,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "50%",
          animation: "float 10s infinite ease-in-out",
        }}
      ></Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          right: "20%",
          width: 120,
          height: 120,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "50%",
          animation: "float 12s infinite ease-in-out",
        }}
      ></Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          left: "25%",
          width: 100,
          height: 100,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "50%",
          animation: "float 8s infinite ease-in-out",
        }}
      ></Box>

      {/* Title */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "white",
          textShadow: "2px 2px 5px rgba(0,0,0,0.3)",
          marginBottom: 3,
        }}
      >
        Welcome to Your Stats Dashboard!
      </Typography>

      {/* Google Animation as Login Button */}
      <Box
        onClick={handleGoogleLogin}
        sx={{
          cursor: "pointer",
          width: 200,
          "&:hover": {
            transform: "scale(1.1)",
            transition: "transform 0.3s ease-in-out",
          },
        }}
      >
        <Lottie animationData={googleAnimation} loop={true} />
      </Box>

      {/* Add CSS for Floating Animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Login;
