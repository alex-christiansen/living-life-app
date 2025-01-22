import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material";
import { Rating } from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import Fuse from "fuse.js";
import { auth, db } from "../utils/firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dinners = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [date, setDate] = useState("");
  const [cost, setCost] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [userDinners, setUserDinners] = useState([]);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [fuse, setFuse] = useState(null);

  useEffect(() => {
    const restaurantData = [
      "The French Laundry",
      "Eleven Madison Park",
      "Osteria Francescana",
      "Per Se",
      "Narisawa",
      "Mirazur",
      "Alinea",
      "Le Bernardin",
      "Noma",
      "The Ledbury",
    ];

    const fuseInstance = new Fuse(restaurantData, {
      includeScore: true,
      threshold: 0.4,
    });
    setFuse(fuseInstance);
    setRestaurantsList(restaurantData);

    fetchDinners();
  }, []);

  const fetchDinners = async () => {
    try {
      const userId = auth.currentUser.uid;
      const dinnersRef = collection(db, "users", userId, "dinners");
      const q = query(dinnersRef, orderBy(sortField, sortDirection));
      const querySnapshot = await getDocs(q);

      const dinners = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserDinners(dinners);
    } catch (error) {
      console.error("Error fetching dinners:", error);
    }
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);
    fetchDinners(); // Re-fetch data with the updated sort order
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const today = new Date().toISOString().split("T")[0];
    if (date > today) {
      setError("The date visited cannot be in the future.");
      return;
    }

    const validCost = parseFloat(cost).toFixed(2);
    if (parseFloat(cost) !== parseFloat(validCost)) {
      setError("The total meal cost must be a valid number with two decimal places.");
      return;
    }

    try {
      const userId = auth.currentUser.uid;

      const newDinner = {
        restaurant,
        date,
        cost: parseFloat(validCost),
        rating,
        timestamp: new Date(),
      };

      await addDoc(collection(db, "users", userId, "dinners"), newDinner);
      
      // Clear all form fields
      setRestaurant("");
      setInputValue("");
      setDate("");
      setCost("");
      setRating(0);
      
      fetchDinners();
    } catch (error) {
      console.error("Error adding dinner:", error);
    }
  };
    

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #FFE3E3, #FFF7E3)",
        minHeight: "100vh",
        padding: 4,
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: "bold", marginBottom: 4, color: "#FF6F61" }}>
        Your Michelin Star Restaurants
      </Typography>

      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === "restaurant"}
                  direction={sortField === "restaurant" ? sortDirection : "asc"}
                  onClick={() => handleSort("restaurant")}
                >
                  Restaurant
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "date"}
                  direction={sortField === "date" ? sortDirection : "asc"}
                  onClick={() => handleSort("date")}
                >
                  Date Visited
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "cost"}
                  direction={sortField === "cost" ? sortDirection : "asc"}
                  onClick={() => handleSort("cost")}
                >
                  Meal Cost ($)
                </TableSortLabel>
              </TableCell>
              <TableCell>Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userDinners.length > 0 ? (
              userDinners.map((dinner) => (
                <TableRow key={dinner.id}>
                  <TableCell>{dinner.restaurant}</TableCell>
                  <TableCell>{dinner.date}</TableCell>
                  <TableCell>
                    {dinner.cost.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </TableCell>
                  <TableCell>
                    <Rating
                      value={dinner.rating}
                      readOnly
                      precision={0.5}
                      icon={<RestaurantIcon fontSize="inherit" />}
                      emptyIcon={<RestaurantIcon fontSize="inherit" sx={{ opacity: 0.3 }} />}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No restaurants added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          backgroundColor: "white",
          padding: 4,
          borderRadius: 4,
          border: "1px solid #ddd",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {error && (
          <Typography variant="body1" sx={{ color: "red", marginBottom: 2 }}>
            {error}
          </Typography>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={restaurantsList}
              getOptionLabel={(option) => option || ''}
              value={restaurant}
              inputValue={inputValue}
              onChange={(event, newValue) => {
                setRestaurant(newValue || '');
              }}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
                setRestaurant(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Restaurant Name"
                  variant="outlined"
                  fullWidth
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Date Visited"
              type="date"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Total Meal Cost ($)"
              type="number"
              variant="outlined"
              fullWidth
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ marginBottom: 1, fontWeight: "bold" }}>
              Rating (out of 5):
            </Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              precision={0.5}
              icon={<RestaurantIcon fontSize="inherit" />}
              emptyIcon={<RestaurantIcon fontSize="inherit" sx={{ opacity: 0.3 }} />}
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button type="submit" variant="contained" sx={{ backgroundColor: "#FF6F61", color: "white" }}>
              Add Restaurant
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/landing')}
          sx={{
            borderColor: '#FF6F61',
            color: '#FF6F61',
            '&:hover': {
              borderColor: '#E85A50',
              backgroundColor: 'rgba(255, 111, 97, 0.1)',
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default Dinners;


// import React, { useState, useEffect } from "react";
// import { Box, TextField, Typography, Button, Autocomplete, Grid } from "@mui/material";
// import { Rating } from "@mui/material"; // Import Rating component
// import RestaurantIcon from "@mui/icons-material/Restaurant";
// import Fuse from "fuse.js"; // For fuzzy search
// import { auth } from "./firebaseConfig"; // Import auth from firebaseConfig
// import { db } from "./firebaseConfig"; // Import Firestore
// import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Firestore functions
// import { useNavigate } from "react-router-dom"; // Import useNavigate


// const Dinners = () => {
//     const navigate = useNavigate();
//     const [restaurant, setRestaurant] = useState("");
//   const [date, setDate] = useState("");
//   const [cost, setCost] = useState("");
//   const [rating, setRating] = useState(0);
//   const [error, setError] = useState(""); // For displaying error messages

//   const [restaurantsList, setRestaurantsList] = useState([]); // To store the list of restaurants
//   const [fuse, setFuse] = useState(null); // Fuse.js instance

//   useEffect(() => {
//     // Simulating fetching restaurant list (replace this with your data source)
//     const restaurantData = [
//       "The French Laundry", "Eleven Madison Park", "Osteria Francescana", "Per Se", "Narisawa", "Mirazur",
//       "Alinea", "Le Bernardin", "Noma", "The Ledbury",
//     ];

//     // Initialize Fuse.js with the restaurant list for fuzzy searching
//     const fuseInstance = new Fuse(restaurantData, {
//       includeScore: true,
//       threshold: 0.4, // Tweak the threshold for fuzziness
//     });
//     setFuse(fuseInstance);
//     setRestaurantsList(restaurantData);
//   }, []);

//   // Fuzzy search for restaurant names
//   const searchRestaurants = (query) => {
//     const results = fuse.search(query).map((result) => result.item);
//     return results;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(""); // Reset any previous errors

//     // Validation for date visited (cannot be in the future)
//     const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
//     if (date > today) {
//       setError("The date visited cannot be in the future.");
//       return;
//     }

//     // Validation for total meal cost (two decimal places)
//     const validCost = parseFloat(cost).toFixed(2);
//     if (parseFloat(cost) !== parseFloat(validCost)) {
//       setError("The total meal cost must be a valid number with two decimal places.");
//       return;
//     }

//     // Proceed with the form submission and save to Firestore
//     try {
//       // Get the current user's UID
//       const userId = auth.currentUser.uid; // You can get this from Firebase Authentication
//       console.log("User ID:", userId);

//       // Add new dinner to the Firestore collection
//       const newDinner = {
//         restaurant,
//         date,
//         cost: parseFloat(validCost),
//         rating,
//         timestamp: serverTimestamp(), // Automatically sets the current timestamp
//       };

//       // Add the new dinner to Firestore
//       await addDoc(collection(db, "users", userId, "dinners"), newDinner);
//       console.log("New Dinner Added:", newDinner);

//       // Clear the form after submission
//       setRestaurant("");
//       setDate("");
//       setCost("");
//       setRating(0);
//     } catch (error) {
//       console.error("Error adding dinner:", error);
//     }
//   };
//   const handleBack = () => {
//     navigate("/landing");
//   };

//   return (
//     <Box
//       sx={{
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #FFE3E3, #FFF7E3)",
//         padding: 4,
//       }}
//     >
//       {/* Header */}
//       <Typography
//         variant="h3"
//         sx={{
//           fontWeight: "bold",
//           marginBottom: 4,
//           color: "#FF6F61",
//           textShadow: "2px 2px 5px rgba(0,0,0,0.2)",
//         }}
//       >
//         Add a Michelin Star Restaurant
//       </Typography>

//       {/* Error Message */}
//       {error && (
//         <Typography variant="body1" sx={{ color: "red", marginBottom: 2 }}>
//           {error}
//         </Typography>
//       )}

//       {/* Form */}
//       <Box
//         component="form"
//         onSubmit={handleSubmit}
//         sx={{
//           width: "100%",
//           maxWidth: 600,
//           backgroundColor: "white",
//           borderRadius: 4,
//           boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)",
//           padding: 4,
//         }}
//       >
//         <Grid container spacing={3}>
//           {/* Restaurant Name */}
//           <Grid item xs={12}>
//             <Autocomplete
//               freeSolo
//               options={restaurantsList}
//               getOptionLabel={(option) => option}
//               onInputChange={(event, value) => setRestaurant(value)}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Restaurant Name"
//                   variant="outlined"
//                   fullWidth
//                   value={restaurant}
//                   required
//                 />
//               )}
//               filterOptions={(options, state) => searchRestaurants(state.inputValue)}
//             />
//           </Grid>

//           {/* Date */}
//           <Grid item xs={12}>
//             <TextField
//               label="Date Visited"
//               type="date"
//               variant="outlined"
//               fullWidth
//               InputLabelProps={{ shrink: true }}
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               required
//             />
//           </Grid>

//           {/* Total Cost */}
//           <Grid item xs={12}>
//             <TextField
//               label="Total Meal Cost ($)"
//               type="number"
//               variant="outlined"
//               fullWidth
//               value={cost}
//               onChange={(e) => setCost(e.target.value)}
//               required
//             />
//           </Grid>

//           {/* Rating */}
//           <Grid item xs={12}>
//             <Typography
//               variant="body1"
//               sx={{ marginBottom: 1, fontWeight: "bold" }}
//             >
//               Rating (out of 5):
//             </Typography>
//             <Rating
//               name="rating"
//               value={rating}
//               onChange={(e, newValue) => setRating(newValue)}
//               precision={0.5}
//               icon={<RestaurantIcon fontSize="inherit" />}
//               emptyIcon={<RestaurantIcon fontSize="inherit" sx={{ opacity: 0.3 }} />}
//             />
//           </Grid>

//           {/* Submit Button */}
//           <Grid item xs={12} sx={{ textAlign: "center" }}>
//             <Button
//               type="submit"
//               variant="contained"
//               sx={{
//                 backgroundColor: "#FF6F61",
//                 color: "white",
//                 fontSize: "1rem",
//                 padding: "10px 24px",
//                 textTransform: "none",
//                 "&:hover": {
//                   backgroundColor: "#E85A50",
//                 },
//               }}
//             >
//               Add Restaurant
//             </Button>
//           </Grid>
//         </Grid>
//       </Box>
//       <Button
//         variant="outlined"
//         onClick={handleBack}
//         sx={{
//           marginTop: 4,
//           borderColor: "#FF6F61",
//           color: "#FF6F61",
//           textTransform: "none",
//           "&:hover": {
//             backgroundColor: "rgba(255, 111, 97, 0.1)",
//           },
//         }}
//       >
//         Back to Dashboard
//       </Button>
//     </Box>
//   );
// };

// export default Dinners;

