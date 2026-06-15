import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15d",
    }
  );
};

export const register = async (req, res) => {
  const { email, password, name, role, photo, gender } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields: email, password, name, role" 
      });
    }

    let user = null;

    if (role === "patient" || role === "assistant") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid role. Must be patient, assistant, or doctor" 
      });
    }

    //check if user exist
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: "User already exist" 
      });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    if (role === "patient" || role === "assistant") {
      user = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

    if (role === "doctor") {
      user = new Doctor({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User Successfully created" });
  } catch (error) {
    console.error("Registration error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Internal server error, Try again" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and password" 
      });
    }

    let user = null;

    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });
    const admin = await User.findOne({ email, role: "admin" }); // Add admin check

    if (patient) {
      user = patient;
    }
    if (doctor) {
      user = doctor;
    }
    if (admin) {
      // Handle admin login
      user = admin;
    }

    //check if user exist
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    //compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials, try again" });
    }

    // get token
    const token = generateToken(user);
    const { password: userPassword, role, appointments, ...rest } = user._doc;
    res.status(200).json({
      success: true,
      message: "Successfully login",
      token,
      data: { ...rest },
      role,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Failed to login" });
  }
};
