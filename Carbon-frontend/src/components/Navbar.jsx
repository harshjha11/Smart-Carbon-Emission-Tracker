import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

{
  /* Navbar component - responsive with scroll behavior and mobile menu */
}
function Navbar({ user, setUser, scrolled }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileView(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  {
    /* Logout function - clears token and user state, then navigates to home */
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMobileMenuOpen(false);
    navigate("/");
  };
  {
    /* Main navigation links - separated into two groups to place actions in the middle */
  }

  const links = [
    { to: "/home", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/goals", label: "Goals" },
    { to: "/achievements", label: "Achievements" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/profile", label: "Profile" },
  ];
  {
    /* Actions are separated to be placed in a dropdown */
  }

  const actionLinks = [
    { to: "/activity", label: "Log Activity" },
    { to: "/offset", label: "Carbon Offset" },
  ];

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "system";
    } catch {
      return "system";
    }
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.toggle("dark", systemDark);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isDarkMode =
    theme === "dark" || (theme === "system" && systemPrefersDark);

  return (
    <>
      {/* Google Font Import */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          .font-poppins {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>
      {/* Navbar */}

      <nav
        className={` fixed w-full
          font-poppins top-0 left-0 right-0 z-50
          transition-all duration-500
          ${
            scrolled
              ? "bg-white/80 bg-gradient-to-br dark:bg-emerald-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
              : "bg-white/60 bg-gradient-to-br dark:bg-emerald-950/80  dark:to-teal-900/50 backdrop-blur-sm"
          }
        `}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(user ? "/home" : "/")}
              className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Go to home"
            >
              <img
                src={logo}
                alt="Carbon Tracker logo"
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </button>
            {/* Desktop Links */}
            {!isMobileView && (
              <div className="flex flex-1 items-center justify-center gap-8">
                {links.slice(0, 2).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `relative text-sm font-medium px-1 py-1 whitespace-nowrap transition-all duration-200
                    ${
                      isActive
                        ? "text-emerald-700 dark:text-emerald-400 font-semibold after:w-full"
                        : "text-slate-700 dark:text-slate-300 hover:text-emerald-400"
                    }
                    after:content-[''] after:absolute after:left-0 after:-bottom-1
                    after:h-[2.5px] after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500
                    after:w-0 after:rounded-full hover:after:w-full after:transition-all after:duration-300`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <div className="relative group">
                  <button
                    className="
                    whitespace-nowrap
                    relative text-[15px] font-medium text-slate-700 dark:text-slate-300
                    px-1 py-1
                    hover:text-emerald-700 dark:hover:text-emerald-400
                    transition-all duration-200
                    flex items-center gap-1
                    after:content-[''] after:absolute after:left-0 after:-bottom-1
                    after:h-[2.5px] after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500
                    after:w-0 after:rounded-full
                    group-hover:after:w-full after:transition-all after:duration-300 after:ease-out
                  "
                  >
                    Actions
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    className="
                    absolute top-full left-1/2 -translate-x-1/2 pt-3
                    opacity-0 invisible
                    group-hover:opacity-100 group-hover:visible
                    transition-all duration-200
                  "
                  >
                    <div
                      className="
                      bg-white/95 backdrop-blur-lg
                      rounded-xl shadow-lg shadow-emerald-100/50
                      border border-emerald-100
                      py-2 min-w-[160px]
                      overflow-hidden
                    "
                    >
                      {actionLinks.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `
                          block px-4 py-2.5
                          text-[14px] font-medium text-slate-700 dark:text-slate-900
                          hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-700/10 dark:hover:text-emerald-400
                          transition-all duration-200
                          ${isActive ? "text-emerald-700 bg-emerald-50/50" : ""}
                        `
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>

                {links.slice(2).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `relative text-sm font-medium px-1 py-1 whitespace-nowrap transition-all duration-200
                    ${
                      isActive
                        ? "text-emerald-700 dark:text-emerald-400 font-semibold after:w-full"
                        : "text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400"
                    }
                    after:content-[''] after:absolute after:left-0 after:-bottom-1
                    after:h-[2.5px] after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500
                    after:w-0 after:rounded-full hover:after:w-full after:transition-all after:duration-300`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
            {/* Theme Toggle */}
            {isMobileView && <div className="flex-1" />}{" "}
            {
              <div className="p-4">
                <div
                  onClick={() => {
                    console.log("clicked");
                    setTheme(isDarkMode ? "light" : "dark");
                  }}
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
            }
            {/* Desktop Auth Button */}
            {!isMobileView && (
              <div className=" ml-auto flex items-center gap-1">
                {user ? (
                  <button
                    onClick={handleLogout}
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
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="font-semibold rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm px-6 py-2.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-200"
                  >
                    Login
                  </button>
                )}
              </div>
            )}
            {/* Mobile Menu Button */}
            {isMobileView && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700"
                  aria-label="Toggle menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    {mobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            )}
          </div>
          {/* Mobile Menu */}

          {isMobileView && mobileMenuOpen && (
            <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/95 backdrop-blur-lg shadow-lg shadow-emerald-100/50 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {[...links.slice(0, 2), ...actionLinks, ...links.slice(2)].map(
                  (item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ),
                )}
              </div>
              {/* Mobile Auth Button */}
              <div className="mt-3 border-t border-slate-200 pt-3">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind navbar */}
      <div className="h-[88px] sm:h-[96px]" />
    </>
  );
}

export default Navbar;
