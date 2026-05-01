import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaArrowLeft,
  FaArrowRight,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaCrown,
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaCamera,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { API_URL, getMediaUrl } from "../utils/api";

const emptyProfile = {
  name: "",
  email: "",
  profilePic: "",
};

const normalizeProfile = (data) => ({
  ...emptyProfile,
  ...(data || {}),
  name: data?.name || "",
  email: data?.email || "",
  profilePic: data?.profilePic || "",
});

function ProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => normalizeProfile(user));
  const [password, setPassword] = useState("");
  const [loadError, setLoadError] = useState(
    user?.email ? "" : "Profile data is not available. Please log in again.",
  );
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving
  const [isSaved, setIsSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [disconnectStatus, setDisconnectStatus] = useState("idle"); // idle | disconnecting
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem("token");

  // Ref for the hidden file input element used for uploading profile pictures
  const fileInputRef = useRef(null);

  // State variables for handling profile picture upload, including the selected file, preview URL, and uploaded image URL
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const getProfileImageSrc = (profilePic) => getMediaUrl(profilePic);

  // Prefer the local preview while upload is in progress, then persisted database URL.
  const profileImage =
    preview || getProfileImageSrc(imageUrl || profile?.profilePic) || "";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    handleUpload(selectedFile);
  };
  // Function to handle profile picture upload via the secure backend (prevents exposing Cloudinary keys)
  const handleUpload = async (selectedFileParam) => {
    const uploadFile = selectedFileParam || file;

    if (!uploadFile) {
      alert("No file selected");
      return;
    }

    const bodyData = new FormData();
    bodyData.append("image", uploadFile);

    try {
      setSaveStatus("saving");

      const res = await axios.post(
        `${API_URL}/api/users/update-profile-pic`,
        bodyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = res.data;

      const newImageUrl = data.user?.profilePic || "";

      setImageUrl(newImageUrl);
      const updatedProfile = normalizeProfile({
        ...profile,
        ...data.user,
      });

      setProfile(updatedProfile);
      setUser?.((prev) => ({ ...prev, ...updatedProfile }));

      setFormSuccess("Profile picture updated!");
    } catch (err) {
      console.error("Upload failed:", err);
      setFormError("Upload failed. Please try again.");
    } finally {
      setSaveStatus("idle");
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setSaveStatus("saving");

      const res = await axios.delete(`${API_URL}/api/users/profile-pic`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      const updatedProfile = normalizeProfile(data.user);
      setProfile(updatedProfile);
      setUser?.((prev) => ({ ...prev, ...updatedProfile }));
      setImageUrl("");
      setPreview(null);
      setFile(null);

      setFormSuccess("Profile photo removed.");
    } catch (err) {
      console.error("Remove failed:", err);
      setFormError("Failed to remove photo.");
    } finally {
      setSaveStatus("idle");
    }
  };

  useEffect(() => {
    if (user?.email) {
      setProfile(normalizeProfile(user));
      setLoadError("");
    }
  }, [user?.email, user?.profilePic]);

  const hasFetched = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // ✅ Redirect if no token
    if (!token) {
      navigate("/login");
      return;
    }

    // 🚫 Prevent multiple API calls (Strict Mode / re-renders)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelled) return;

        const freshProfile = normalizeProfile(res.data);
        setProfile(freshProfile);

        // ✅ Update user only if changed (prevents re-renders)
        setUser?.((prev) => {
          if (!prev) return freshProfile;

          const isSame =
            prev.name === freshProfile.name &&
            prev.email === freshProfile.email &&
            prev.profilePic === freshProfile.profilePic;

          if (isSame) return prev;

          return { ...prev, ...freshProfile };
        });

        setLoadError("");
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (!cancelled) {
          setLoadError("Profile data is not available. Please log in again.");
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    if (!isEditing) setIsEditing(true);
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const res = await axios.put(
        `${API_URL}/api/users/me`,
        {
          name: profile.name,
          email: profile.email,
          ...(password.trim() ? { password } : {}),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedProfile = normalizeProfile(res.data);
      setProfile(updatedProfile);
      setUser?.((prev) => ({ ...prev, ...updatedProfile }));
      setPassword("");
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action is permanent.",
    );
    if (!confirmed) return;

    try {
      setDeletingAccount(true);
      await axios.delete(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("token");
      setUser?.(null);
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (err) {
      console.error("Delete account failed:", err);
      toast.error("Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ==================== BACKGROUND (Same as Achievements/Leaderboard) ==================== */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-900/80 dark:via-teal-900/80 dark:to-emerald-900/60" />

        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-green-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-300/10 rounded-full blur-3xl animate-pulse" />

        {/* Additional decorative circles */}
        <div className="absolute top-1/2 right-10 w-48 h-48 bg-amber-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-10 w-56 h-56 bg-purple-200/10 rounded-full blur-3xl" />

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
        <svg
          className="absolute top-1/3 left-8 w-16 h-16 text-amber-200/20 rotate-45"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20 relative">
        {/* Page Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 mb-5 relative overflow-hidden"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={profile.name || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <FaUser className="text-white text-3xl" />
            )}
            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-1 -right-1 z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <HiSparkles className="text-amber-400 text-lg" />
            </motion.div>
          </motion.div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 dark:text-white">
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
              Profile
            </span>
          </h1>

          <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto dark:text-white">
            Manage your account settings and personalize your eco-journey
            experience.
          </p>

          {/* Stats Bar */}
          {profile.name && (
            <motion.div
              className="mt-6 inline-flex flex-wrap items-center justify-center gap-6 px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FaCrown className="text-emerald-600 text-sm" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-slate-800">
                    Eco Warrior
                  </p>
                  <p className="text-xs text-slate-500">Current Level</p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <FaCalendarAlt className="text-teal-600 text-sm" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-slate-800">Active</p>
                  <p className="text-xs text-slate-500">Member Status</p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2 hidden sm:flex">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <FaShieldAlt className="text-amber-600 text-sm" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-slate-800">Verified</p>
                  <p className="text-xs text-slate-500">Account</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Profile Card Container */}
        <motion.div
          className="rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-100/30 border border-emerald-100 p-6 md:p-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <FaEdit className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Account Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Update your personal information
                </p>
              </div>
            </div>
            {isEditing && (
              <motion.span
                className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium flex items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved Changes
              </motion.span>
            )}
          </div>

          {/* Loading State */}
          {loadError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">
                Unable to load profile
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("token");
                  setUser?.(null);
                  navigate("/login");
                }}
                className="mt-6 rounded-full bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700"
              >
                Log in again
              </button>
            </div>
          ) : (
            /* Profile Form */
            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Profile Avatar Section */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-emerald-100"
              >
                <div className="relative">
                  <div className="relative w-24 h-24 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-200/50 ring-4 ring-white/80">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-800">
                    {profile.name || "User"}
                  </h3>
                  <p className="text-slate-500 text-sm">{profile.email}</p>
                  <div className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saveStatus === "saving"}
                        className="inline-flex items-center gap-2 rounded-md border border-emerald-600 bg-emerald-600 px-4 py-2 font-medium text-white shadow-md shadow-emerald-200/50 transition-colors hover:bg-emerald-700 hover:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-emerald-400 dark:bg-emerald-400 dark:text-slate-950 dark:shadow-none dark:hover:bg-emerald-300"
                      >
                        Upload Photo
                      </button>

                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={saveStatus === "saving"}
                          className="inline-flex items-center gap-2 rounded-md border border-rose-600 bg-rose-600 px-4 py-2 font-medium text-white shadow-md shadow-rose-200/50 transition-colors hover:bg-rose-700 hover:border-rose-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-400 dark:bg-rose-400 dark:text-slate-950 dark:shadow-none dark:hover:bg-rose-300"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                        🌱 Eco Enthusiast
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                        🌍 Planet Protector
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Form Fields */}
              <div className="grid gap-5">
                {/* Name Input */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>
                </motion.div>

                {/* Email Input */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">
                    New Password
                    <span className="text-slate-400 font-normal ml-1">
                      (optional)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!isEditing) setIsEditing(true);
                      }}
                      placeholder="Enter new password to change"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <p className="text-xs text-slate-400 ml-1">
                    Leave blank to keep your current password
                  </p>
                </motion.div>

                {/* Save Button */}
                <motion.div variants={itemVariants} className="pt-4">
                  <motion.button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                    whileHover={{
                      scale: saving ? 1 : 1.02,
                      y: saving ? 0 : -2,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saving ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <FaSave className="text-lg" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="mt-4 w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-red-300 bg-red-50 px-8 py-3.5 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {deletingAccount ? "Deleting Account..." : "Delete Account"}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Security Tips Section */}
        <motion.div
          className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <div className="text-center md:text-left flex-grow">
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Security Tips
              </h3>
              <p className="text-sm text-slate-600">
                Use a strong password with at least 8 characters, including
                numbers and special characters for better security.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links – UPDATED BUTTON STYLE */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-base font-medium text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-base font-medium text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          >
            View Leaderboard →
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePage;
