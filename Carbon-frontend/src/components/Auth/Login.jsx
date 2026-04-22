import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import logo from "../../assets/logo.png";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        },
      );

      localStorage.setItem("token", res.data.token);
      onLogin(res.data.user);

      toast.success("Login successful!", { autoClose: 2000 });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-400/30 via-white/30 to-indigo-50/30 dark:from-slate-950/85 dark:via-slate-950/80 dark:to-slate-900/85">
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center relative overflow-hidden">
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl w-[95%] max-w-md p-8 z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-3 rounded-full shadow mb-2">
              <FaEnvelope className="text-2xl text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Sign in with email
            </h2>
            <p className="text-sm text-gray-500 text-center mt-1">
              Enter your email and password to access your account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center bg-white border rounded px-3 py-2 shadow-sm">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email"
                className="outline-none w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center bg-white border rounded px-3 py-2 shadow-sm">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Password"
                className="outline-none w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Link
              to="/forgot-password"
              className="block text-right text-sm text-emerald-500 hover:underline"
            >
              Forgot password?
            </Link>

            <button
              type="submit"
              className="w-full py-2 rounded bg-gradient-to-r from-black via-gray-800 to-black text-white font-semibold shadow-md hover:opacity-90 transition"
            >
              Get Started
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/")}
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
                Back to Home
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
