import { createContext, useCallback, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/api";

// Create the context
const GoalContext = createContext();

// Custom hook to use the GoalContext
export const useGoal = () => useContext(GoalContext);

// Provider component
export const GoalProvider = ({ children }) => {
  const [goal, setGoal] = useState(null);

  // Fetch the goal from backend
  const fetchGoal = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setGoal(null);
        return;
      }

      const res = await axios.get(`${API_URL}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoal(res.data?.weeklyGoal ?? null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setGoal(null);
      }
      console.error("Failed to fetch goal", err);
    }
  }, []);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  return (
    <GoalContext.Provider value={{ goal, setGoal, fetchGoal }}>
      {children}
    </GoalContext.Provider>
  );
};
