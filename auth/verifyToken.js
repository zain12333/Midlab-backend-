import jwt from "jsonwebtoken";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";

// ─── authenticate ─────────────────────────────────────────────────────────────
// Verifies the JWT and attaches req.userId + req.role to every protected request.
export const authenticate = async (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith("Bearer")) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const token = authToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Check expiry explicitly (jwt.verify already throws on expiry,
    // but this guards against clock skew edge cases)
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ success: false, message: "Token is expired" });
    }

    req.userId = decoded.id;
    req.role   = decoded.role;

    // For doctors, also attach doctorId
    if (req.role === "doctor") {
      const doctor = await Doctor.findById(req.userId).select("_id");
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }
      req.doctorId = doctor._id;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ─── restrict ─────────────────────────────────────────────────────────────────
// Checks whether the authenticated user's role is in the allowed list.
// Uses req.role (decoded from JWT) — no extra DB queries needed.
export const restrict = (roles) => (req, res, next) => {
  if (!req.role || !roles.includes(req.role)) {
    return res
      .status(401)
      .json({ success: false, message: "You are not authorized" });
  }
  next();
};
