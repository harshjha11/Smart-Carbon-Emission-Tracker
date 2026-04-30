import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaBullseye,
  FaShieldAlt,
  FaListOl,
  FaTrophy,
  FaClock,
  FaGlobeAmericas,
  FaArrowRight,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import earthImage from "../assets/earth_image.jpg";
import { API_URL, getMediaUrl } from "../utils/api";

function Landing() {
  const LEADERBOARD_REFRESH_MS = 5000;
  const navigate = useNavigate();
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getProfileImageSrc = (profilePic) => getMediaUrl(profilePic);

  const cards = [
    {
      title: "Track Emissions",
      text: "Log travel, food, and electricity usage to measure your carbon footprint.",
      icon: <FaChartLine />,
    },
    {
      title: "Set Goals",
      text: "Define weekly reduction goals and monitor your progress with simple insights.",
      icon: <FaBullseye />,
    },
    {
      title: "Stay Consistent",
      text: "Earn achievements and keep improving your habits over time.",
      icon: <FaShieldAlt />,
    },
  ];

  const steps = [
    {
      title: "Create your account",
      description:
        "Sign up in under a minute and set your daily activity baseline.",
      icon: <FaListOl />,
    },
    {
      title: "Add your activities",
      description:
        "Record transport, home energy, and lifestyle actions to calculate emissions.",
      icon: <FaChartLine />,
    },
    {
      title: "Improve and compete",
      description:
        "Set goals, unlock achievements, and check the leaderboard ranking.",
      icon: <FaTrophy />,
    },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async (showLoader = false) => {
      if (showLoader && isMounted) {
        setLeaderboardLoading(true);
      }

      try {
        const response = await axios.get(`${API_URL}/api/activities/leaderboard`, {
          params: { t: Date.now() },
        });
        if (isMounted) {
          setLeaderboardUsers(Array.isArray(response.data) ? response.data : []);
          setLastUpdated(new Date());
        }
      } catch (error) {
        if (isMounted) {
          setLeaderboardUsers([]);
        }
      } finally {
        if (isMounted) {
          setLeaderboardLoading(false);
        }
      }
    };

    fetchLeaderboard(true);
    const intervalId = setInterval(
      () => fetchLeaderboard(false),
      LEADERBOARD_REFRESH_MS,
    );

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [API_URL, LEADERBOARD_REFRESH_MS]);

  // Theme state management with system preference fallback
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "system";
    }
    // Try to read theme from localStorage, fallback to system if not available or on error
    try {
      return localStorage.getItem("theme") || "system";
    } catch {
      return "system";
    }
  });

  // State to track if the system prefers dark mode
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    // Check if the system prefers dark mode
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Effect to apply theme and listen for system preference changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    // Apply the selected theme to the document root
    const root = document.documentElement;
    // Function to apply the current theme based on user selection and system preference
    const applyTheme = () => {
      if (theme === "dark") {
        root.classList.add("dark");
      } else if (theme === "light") {
        root.classList.remove("dark");
      } else {
        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.toggle("dark", systemDark);
      }
    };
    // Initial application of the theme on component mount and whenever theme or system preference changes
    applyTheme();

    // Listen for changes in system color scheme preference and update state accordingly
    if (!window.matchMedia) {
      return;
    }
    // Set up a media query listener for changes in the system's color scheme preference
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    // Listener function to update system preference state and re-apply theme if user preference is "system"
    const listener = () => {
      setSystemPrefersDark(media.matches);
      if (theme === "system") {
        applyTheme();
      }
    };
    // Add the listener to the media query
    media.addEventListener("change", listener);
    // Clean up the listener on component unmount
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [theme]);

  // Effect to save the user's theme preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    // Try to save the theme preference to localStorage, but ignore errors (e.g., in private mode or if storage is blocked)
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Ignore storage errors (private mode, blocked storage, etc.)
    }
  }, [theme]);
  // Determine if dark mode should be active based on user preference and system settings
  const isDarkMode =
    theme === "dark" || (theme === "system" && systemPrefersDark);

  return (
    <div className="min-h-screen bg-[#f4f8f6] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-emerald-100/70 bg-emerald-800/40 backdrop-blur-xl dark:bg-emerald-800/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="inline-flex items-center gap-3 rounded-full bg-emerald-50 px-3 py-2 text-lg font-bold text-emerald-700">
            <img
              src={logo}
              alt="Carbon Tracker logo"
              className="h-10 w-10 rounded-full object-contain"
            />
          </div>
          <div className="hidden items-center gap-20 text-lg font-semibold text-slate-700 dark:text-slate-300 md:flex">
            <Link to="/learn" className="hover:text-emerald-500">
              How It Works
            </Link>
            <a href="#live-leaderboard" className=" hover:text-emerald-500">
              Leaderboard
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="p-4">
              <div
                onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                className={`w-14 h-8  flex items-center rounded-full p-1 cursor-pointer transition-all duration-300
                  ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                aria-label={`Theme: ${isDarkMode ? "dark" : "light"}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center
                    ${isDarkMode ? "translate-x-6" : "translate-x-0"}`}
                ></div>
              </div>
            </div>

            <Link
              to="/login"
              className="font-semibold
                  rounded-full 
                  bg-gradient-to-r from-emerald-900 to-teal-500
                  text-white text-sm 
                  px-7 py-2.5 
                  hover:from-teal-500 hover:to-emerald-900
                  hover:shadow-lg hover:shadow-emerald-600/50
                  hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="font-semibold
                  rounded-full 
                  bg-gradient-to-r from-emerald-900 to-teal-500
                  text-white text-sm 
                  px-7 py-2.5 
                  hover:from-teal-500 hover:to-emerald-900
                  hover:shadow-lg hover:shadow-emerald-600/50
                  hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/50 via-gray-100/15 to-teal-100/30 dark:from-emerald-900/80 dark:via-teal-900/40 dark:to-emerald-900/80" />
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-cyan-800 px-4 py-1.5 text-xs md:text-sm font-semibold text-amber-50 shadow-sm"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Premium climate intelligence for everyday users
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl dark:text-white">
              Reduce emissions with precision, not guesswork.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-white">
              Carbon Tracker combines real-time ranking, guided actions, and
              measurable weekly impact so your sustainable choices turn into
              visible progress.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-950 to-teal-600 px-7 py-2.5 text-sm md:text-base font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Create Free Account
                <FaArrowRight className="text-xs" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center rounded-full border-2 border-emerald-700 dark:border-emerald-800/80 dark:text-emerald-800 px-7 py-2.5 text-sm md:text-base font-semibold text-green-600 hover:bg-emerald-50 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                I Already Have an Account
              </button>
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl bg-emerald-800/10 dark:bg-white backdrop-blur-sm shadow-xl shadow-emerald-100/30 border border-emerald-100 p-6 md:p-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mb-4 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
              <img
                src={earthImage}
                alt="Earth illustration"
                className="rounded-3xl object-contain"
              />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              At a glance
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-100/50 to-teal-100 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Refresh Speed
                </p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-800">
                  <FaClock className="text-emerald-600" /> 5s
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-rose-50/50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Global Impact
                </p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-800">
                  <FaGlobeAmericas className="text-teal-600" /> Live
                </p>
              </div>
            </div>
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-950 to-teal-600 px-7 py-2.5 text-sm md:text-base font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4">
              <p className="text-sm font-medium text-emerald-50">
                Track emissions, set goals, and climb rankings from a single
                dashboard.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-5 md:grid-cols-3 mx-auto max-w-7xl px-6 pb-16">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className="rounded-3xl bg-emerald-800/10 bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-100/30 border border-emerald-100 p-6 md:p-8 mt-10"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700">
                {card.icon}
              </div>
              <h2 className="mt-1 text-xl font-semibold">{card.title}</h2>
              <p className="mt-2 text-slate-600">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-6 py-16 rounded-3xl bg-emerald-800/10 backdrop-blur-sm shadow-xl shadow-emerald-100/30 border border-emerald-100 p-6 md:p-8 mt-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-black">
            How Carbon Tracker Works
          </h2>
          <p className="mt-3 max-w-3xl font-poppins text-slate-600 dark:text-white">
            From signup to leaderboard rankings, the platform helps you measure
            your footprint and improve with clear daily actions.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/35 p-6 shadow-sm"
              >
                <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  {step.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="live-leaderboard" className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-black">
              Live Leaderboard
            </h2>
            <a
              href="#live-leaderboard"
              className="text-base font-semibold text-black"
            >
              Live Updates
            </a>
          </div>
          <p className="mt-4 text-lg text-slate-600 font-poppins dark:text-black">
            Rankings update in near real-time so you can track top performers as
            activity gets logged.
          </p>
          <p className="mt-2 text-base text-slate-500 font-poppins dark:text-black">
            Auto-refresh every {Math.floor(LEADERBOARD_REFRESH_MS / 1000)}{" "}
            seconds
            {lastUpdated
              ? ` - Last updated: ${lastUpdated.toLocaleTimeString()}`
              : ""}
          </p>

          <div className="mt-10 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-100/60">
            {leaderboardLoading ? (
              <div className="p-10 text-base text-slate-500">
                Loading leaderboard...
              </div>
            ) : leaderboardUsers.length === 0 ? (
              <div className="p-10 text-base text-slate-500">
                No leaderboard data yet this week.
              </div>
            ) : (
              <table className="w-full text-left text-base">
                <thead className="bg-gradient-to-r from-emerald-900 to-teal-600 backdrop-blur text-base text-white">
                  <tr>
                    <th className="px-8 py-5 font-semibold">Rank</th>
                    <th className="px-8 py-5 font-semibold">User</th>
                    <th className="px-8 py-5 text-right font-semibold">
                      Weekly CO2
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 backdrop-blur-sm">
                  {leaderboardUsers.slice(0, 5).map((user, index) => (
                    <tr
                      key={user._id || `${user.name}-${index}`}
                      className="border-t border-slate-100 transition hover:bg-emerald-50/50"
                    >
                      <td className="px-8 py-6 text-lg font-semibold text-slate-950">
                        #{user.rank || index + 1}
                      </td>
                      <td className="px-8 py-6 text-slate-950">
                        <div className="flex items-center gap-4">
                          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-200 bg-white text-base font-bold text-slate-950/50 shadow-sm">
                            {user.profilePic ? (
                              <img
                                src={getProfileImageSrc(user.profilePic)}
                                alt={user.name || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              user.name?.charAt(0)?.toUpperCase() || "U"
                            )}
                          </span>
                          <span className="text-lg font-medium">
                            {user.name || "Anonymous User"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right text-lg font-semibold text-emerald-700">
                        {Number(user.totalCO2 || 0).toFixed(2)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
          <p>
            Carbon Tracker helps users monitor, reduce, and compare carbon
            emissions.
          </p>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:text-white">
              How It Works
            </a>
            <a href="#live-leaderboard" className="hover:text-white">
              Leaderboard
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
