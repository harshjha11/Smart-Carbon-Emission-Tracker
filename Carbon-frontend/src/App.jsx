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
import { API_URL } from "./utils/api";

const HIDE_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
  "/learn",
];

const PrivateRoute = ({ element, authChecked }) => {
  const token = localStorage.getItem("token");

  if (!authChecked && token) {
    return null;
  }

  return token ? element : <Navigate to="/login" />;
};

// Main App component
function App() {
  // Initialize user state from localStorage token
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token } : null;
  });
  const [authChecked, setAuthChecked] = useState(false);
  // React Router hooks for navigation and location
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const hydrateUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setAuthChecked(true);
        }
        return;
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Invalid session");
        }

        const userData = await res.json();
        if (!cancelled) {
          setUser({ ...userData, token });
        }
      } catch (err) {
        console.error("Failed to hydrate session", err);
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
        window.clearTimeout(timeoutId);
      }
    };

    hydrateUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/home");
  };

  // Check if current route is in hideRoutes
  const shouldHideNavbar = HIDE_ROUTES.includes(location.pathname);
  const shouldHideFooter = HIDE_ROUTES.includes(location.pathname);

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
        <Route
          path="/home"
          element={<PrivateRoute authChecked={authChecked} element={<Home />} />}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute authChecked={authChecked} element={<Dashboard />} />}
        />
        <Route
          path="/activity"
          element={<PrivateRoute authChecked={authChecked} element={<ActivityForm />} />}
        />
        <Route
          path="/goals"
          element={<PrivateRoute authChecked={authChecked} element={<Goals />} />}
        />
        <Route
          path="/achievements"
          element={<PrivateRoute authChecked={authChecked} element={<Achievements />} />}
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute
              authChecked={authChecked}
              element={<ProfilePage user={user} setUser={setUser} />}
            />
          }
        />
        <Route
          path="/offset"
          element={<PrivateRoute authChecked={authChecked} element={<Offset />} />}
        />
        <Route path="/learn-more" element={<LearnMore />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />

      {!shouldHideFooter && <Footer />}
    </>
  );
}

export default App;
