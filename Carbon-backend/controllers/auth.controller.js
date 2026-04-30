const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 special character
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return passwordRegex.test(password);
};

// Generate a 6-digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Step 1: Send OTP to email
// Step 1: Send OTP to email
exports.sendOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate OTP and set expiry (10 minutes)
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Find existing user or create new one with email only
    let user = await User.findOne({ email });
    if (user) {
      if (user.password) {
        return res.status(400).json({ message: "Email is already registered. Please log in." });
      }
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.resetOtpVerified = false;
      await user.save();
    } else {
      user = new User({
        email,
        otp,
        otpExpiry,
        resetOtpVerified: false,
        isVerified: false
      });
      await user.save();
    }

    // Send OTP via email
    await sendEmail(
      email,
      "Your Carbon Tracker OTP",
      `Your OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`
    );

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    // 🔴 ADD THIS LINE (VERY IMPORTANT)
    console.error("SEND OTP ERROR:", err);

    res.status(500).json({
      message: "Error sending OTP",
      error: err.message
    });
  }
};

// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      if (!user.password) {
        return res.json({ message: "Email already verified" });
      }
      return res.status(400).json({ message: "Email is already registered. Please log in." });
    }

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification error", error: err.message });
  }
};

// Step 3: Register (after OTP verification)
exports.register = async (req, res) => {
  const { name, password } = req.body;
  const email = req.body.email?.trim().toLowerCase();
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    // Check if already registered (has password)
    if (user.password) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character"
      });
    }

    // Hash password and save user details
    const hashedPassword = await bcrypt.hash(password, 10);
    user.name = name;
    user.password = hashedPassword;
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

// Step 4: Login
exports.login = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.trim().toLowerCase();
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Please complete registration first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET?.trim(), { expiresIn: "2h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// Step 5: Forgot Password - Send OTP
exports.forgotPasswordOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate OTP and set expiry (10 minutes)
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.resetOtpVerified = false;
    await user.save();

    // Send OTP via email
    await sendEmail(
      email,
      "Carbon Tracker - Password Reset OTP",
      `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`
    );

    res.json({ message: "Password reset OTP sent to email" });
  } catch (err) {
    console.error("FORGOT PASSWORD OTP ERROR:", err);
    res.status(500).json({ message: "Error sending password reset OTP", error: err.message });
  }
};

// Step 6: Verify Forgot Password OTP
exports.verifyForgotOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.resetOtpVerified = true;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification error", error: err.message });
  }
};

// Step 7: Reset Password (after OTP verification)
exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const email = req.body.email?.trim().toLowerCase();
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.resetOtpVerified || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Please verify a valid OTP before resetting password" });
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character"
      });
    }

    // Hash password and clear OTP fields
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.resetOtpVerified = false;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password reset error", error: err.message });
  }
};
