import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaCar,
  FaBolt,
  FaUtensils,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPlus,
} from "react-icons/fa";

const ActivityForm = () => {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) return toast.error("Select an activity type");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/activities`,
        { type, data },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Logged! CO₂: ${res.data.carbonFootprint} kg`);
      setType("");
      setData({});
    } catch (err) {
      toast.error("Error logging activity");
    } finally {
      setLoading(false);
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  const activityTypes = [
    {
      value: "transport",
      label: "Transport",
      icon: <FaCar />,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      value: "electricity",
      label: "Electricity",
      icon: <FaBolt />,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      value: "diet",
      label: "Diet",
      icon: <FaUtensils />,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  const renderInputs = () => {
    switch (type) {
      case "transport":
        return (
          <>
            <motion.div
              custom={0}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-base font-semibold text-slate-700 mb-3">
                Mode of Transport
              </label>
              <select
                className="w-full border border-slate-300 rounded-xl py-3 px-4 text-slate-800 bg-white cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                value={data.mode || ""}
                onChange={(e) => setData({ ...data, mode: e.target.value })}
              >
                <option value="">Select mode</option>
                <option value="car">🚗 Car</option>
                <option value="bus">🚌 Bus</option>
                <option value="bike">🏍️ Bike / Motorcycle</option>
                <option value="train">🚆 Train</option>
              </select>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Choose how you traveled today
              </p>
            </motion.div>

            <motion.div
              custom={1}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-base font-semibold text-slate-700 mb-3">
                Distance Traveled
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g., 25"
                  className="w-full border border-slate-300 rounded-xl py-3 px-4 pr-14 text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                  value={data.distance || ""}
                  onChange={(e) =>
                    setData({ ...data, distance: e.target.value })
                  }
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-base font-medium">
                  km
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Example: Daily commute to office = ~15-30 km
              </p>
            </motion.div>
          </>
        );

      case "electricity":
        return (
          <motion.div
            custom={0}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            <label className="block text-base font-semibold text-slate-700 mb-3">
              Electricity Usage
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g., 150"
                className="w-full border border-slate-300 rounded-xl py-3 px-4 pr-16 text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                value={data.usage || ""}
                onChange={(e) => setData({ ...data, usage: e.target.value })}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-base font-medium">
                kWh
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Check your electricity bill. Average Indian household uses 150-250
              kWh/month
            </p>
          </motion.div>
        );

      case "diet":
        return (
          <motion.div
            custom={0}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            <label className="block text-base font-semibold text-slate-700 mb-3">
              Your Diet Type
            </label>
            <select
              className="w-full border border-slate-300 rounded-xl py-3 px-4 text-slate-800 bg-white cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
              value={data.dietType || ""}
              onChange={(e) => setData({ ...data, dietType: e.target.value })}
            >
              <option value="">Select your diet</option>
              <option value="vegetarian">🥗 Vegetarian</option>
              <option value="nonVegetarian">🍖 Non-Vegetarian</option>
              <option value="vegan">🌱 Vegan</option>
            </select>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Your dietary choices significantly impact your carbon footprint
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-base md:text-lg">
      {/* ==================== BACKGROUND (Same as Home/Dashboard) ==================== */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-900/80 dark:via-teal-900/80 dark:to-emerald-900/60" />

        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-green-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-300/10 rounded-full blur-3xl animate-pulse" />

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Leaf Decorations */}
        <svg
          className="absolute top-40 right-20 w-24 h-24 text-emerald-200/30 rotate-12"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
        <svg
          className="absolute bottom-60 left-16 w-20 h-20 text-teal-200/25 -rotate-45"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20 relative">
        {/* Page Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 mb-5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FaPlus className="text-white text-3xl" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 dark:text-white">
            Log Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              Activity
            </span>
          </h1>

          <p className="text-slate-600 text-base md:text-lg max-w-md mx-auto leading-relaxed dark:text-white">
            Tell us what you did today — we&apos;ll calculate your CO₂ impact.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-100/30 border border-emerald-100 p-6 md:p-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Activity Type Selection */}
            <div>
              <label className="block text-base md:text-lg font-bold text-slate-800 mb-4">
                What type of activity?
              </label>

              {/* Activity Type Cards */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {activityTypes.map((activity) => (
                  <motion.button
                    key={activity.value}
                    type="button"
                    onClick={() => {
                      setType(activity.value);
                      setData({});
                    }}
                    className={`relative p-5 rounded-2xl border-2 transition-all duration-200 ${
                      type === activity.value
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${activity.bg} ${activity.color} flex items-center justify-center mx-auto mb-3 text-xl`}
                    >
                      {activity.icon}
                    </div>
                    <p
                      className={`text-base font-semibold ${
                        type === activity.value
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      {activity.label}
                    </p>
                    {type === activity.value && (
                      <motion.div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Fallback Select (hidden but functional) */}
              <select
                className="sr-only"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setData({});
                }}
              >
                <option value="">Choose activity</option>
                <option value="transport">Transport</option>
                <option value="electricity">Electricity</option>
                <option value="diet">Diet</option>
              </select>
            </div>

            {/* Dynamic Input Fields */}
            {type && (
              <motion.div
                className="space-y-6 pt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                {renderInputs()}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !type}
              className={`w-full rounded-full py-4 px-6 font-semibold text-lg transition-all duration-200 ${
                loading || !type
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5"
              }`}
              whileHover={!loading && type ? { scale: 1.02 } : {}}
              whileTap={!loading && type ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Calculating & Logging...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaLeaf className="text-xl" />
                  Log Activity & Calculate CO₂
                </span>
              )}
            </motion.button>
          </form>

          {/* Info Box */}
          <motion.div
            className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <p className="text-base text-slate-700 leading-relaxed">
                  <span className="font-bold text-emerald-700">Pro tip:</span>{" "}
                  Log your activities regularly to track your carbon footprint
                  over time and discover personalized tips to reduce your
                  environmental impact.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Links – UPDATED BUTTON STYLE */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-base font-medium text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => navigate("/goals")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-base font-medium text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          >
            Set Your Goals →
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityForm;
