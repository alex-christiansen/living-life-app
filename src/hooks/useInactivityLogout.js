import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";

const useInactivityLogout = (timeout = 300000) => { // Default to 5 minutes
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        signOut(auth)
          .then(() => {
            console.log("User logged out due to inactivity.");
            window.location.href = "/"; // Redirect to the login page
          })
          .catch((error) => console.error("Error logging out:", error));
      }, timeout);
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Initialize the timer
    resetTimer();

    return () => {
      // Cleanup listeners and timer
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [timeout]);
};

export default useInactivityLogout;
