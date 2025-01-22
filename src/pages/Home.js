import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Grid } from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();
  const [restaurantCount, setRestaurantCount] = useState(0);

  useEffect(() => {
    const fetchRestaurantCount = async () => {
      try {
        const userId = auth.currentUser.uid;
        const dinnersRef = collection(db, "users", userId, "dinners");
        
        // Create query for dates in 2024
        const startDate = "2025-01-01";
        const endDate = "2025-12-31";
        const q = query(
          dinnersRef,
          where("date", ">=", startDate),
          where("date", "<=", endDate)
        );

        const querySnapshot = await getDocs(q);
        setRestaurantCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching restaurant count:", error);
      }
    };

    fetchRestaurantCount();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out.");
      navigate("/"); // Redirect to public landing page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const buttons = [
    { 
      title: "Dinners", 
      subtitle: `Visited this year: ${restaurantCount}`,
      icon: <RestaurantIcon sx={{ fontSize: "1.5rem" }} />, 
      route: "/dinners",
      primary: true 
    },
    { title: "Miles", icon: <FlightIcon />, route: "/miles" },
    { title: "Runs", icon: <DirectionsRunIcon />, route: "/runs" },
  ];

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #4285F4, #E3F2FD)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 4,
      }}
    >
      {/* Header */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "white",
          textShadow: "2px 2px 5px rgba(0,0,0,0.3)",
          marginBottom: 4,
        }}
      >
        Welcome to Your Life Dashboard!
      </Typography>

      {/* Buttons */}
      <Grid container spacing={4} justifyContent="center">
        {buttons.map((button, index) => (
          <Grid item key={index}>
            <Button
              variant="contained"
              startIcon={button.icon}
              onClick={() => navigate(button.route)}
              sx={{
                backgroundColor: "#FF6F61",
                color: "white",
                fontSize: button.primary ? "1.2rem" : "1rem",
                padding: button.primary ? "20px 40px" : "12px 24px",
                borderRadius: "8px",
                textTransform: "none",
                transform: button.primary ? 'scale(1.4)' : 'none',
                marginX: button.primary ? '2rem' : '0',
                marginY: button.primary ? '1rem' : '0',
                display: 'flex',
                flexDirection: button.primary ? 'column' : 'row',
                gap: button.primary ? '0.5rem' : '0.25rem',
                "&:hover": {
                  backgroundColor: "#E85A50",
                },
              }}
            >
              <Box>
                {button.title}
                {button.subtitle && (
                  <Typography 
                    sx={{ 
                      fontSize: '1rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    {button.subtitle}
                  </Typography>
                )}
              </Box>
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="outlined"
        startIcon={<LogoutIcon />}
        sx={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          color: "white",
          borderColor: "white",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Home;
