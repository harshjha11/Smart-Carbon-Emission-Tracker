import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import VerifyOtp from "./components/Auth/VerifyOtp";
import ResetPassword from "./components/Auth/ResetPassword";
import ActivityForm from "./components/ActivityForm";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import Achievements from "./components/Achievements";
import ProfilePage from "./components/ProfilePage";

import Goals from "./pages/Goals";
import Home from "./pages/Home";
import Offset from "./pages/Offset";
import Landing from "./pages/Landing";
import LearnMore from "./pages/LearnMore";
import Learn from "./pages/Learn";
import ForgotPassword from "./pages/ForgotPassword";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Main App component
function App() {
  // Initialize user state from localStorage token
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token } : null;
  });
  // React Router hooks for navigation and location
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/home");
  };
  // PrivateRoute component to protect routes that require authentication
  const PrivateRoute = ({ element }) => {
    const token = localStorage.getItem("token");
    return token ? element : <Navigate to="/login" />;
  };

  // Hide navbar/footer on auth pages
  const hideRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/learn",
  ];
  // Check if current route is in hideRoutes
  const shouldHideNavbar = hideRoutes.includes(location.pathname);
  const shouldHideFooter = hideRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar user={user} setUser={setUser} />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/learn" element={<Learn />} />

        <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Landing />}
        />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} />}
        />
        <Route
          path="/activity"
          element={<PrivateRoute element={<ActivityForm />} />}
        />
        <Route path="/goals" element={<PrivateRoute element={<Goals />} />} />
        <Route
          path="/achievements"
          element={<PrivateRoute element={<Achievements />} />}
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/profile"
          element={<PrivateRoute element={<ProfilePage setUser={setUser} />} />}
        />
        <Route path="/offset" element={<PrivateRoute element={<Offset />} />} />
        <Route path="/learn-more" element={<LearnMore />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />

      {!shouldHideFooter && <Footer />}
    </>
  );
}

export default App;
