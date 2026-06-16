import express from "express";
import {
  updateUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  getUserProfile,
  getMyAppointments,
  createAppointment,
} from "../Controllers/userController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

// Both patients and lab assistants are stored in the User collection
// and share the same profile/appointment endpoints.
const USER_ROLES = ["patient", "assistant"];

router.get("/",    authenticate, restrict(["admin"]),      getAllUsers);
router.get("/:id", authenticate, restrict(USER_ROLES),    getSingleUser);
router.delete("/:id", authenticate, restrict(USER_ROLES), deleteUser);

router.get("/profile/me",  authenticate, restrict(USER_ROLES), getUserProfile);
router.put("/profile/me",  authenticate, restrict(USER_ROLES), updateUser);
router.put("/:id",         authenticate, restrict(USER_ROLES), updateUser);

router.get(
  "/appointments/my-appointments",
  authenticate,
  restrict(USER_ROLES),
  getMyAppointments
);
router.post(
  "/appointments/create-appointment",
  authenticate,
  restrict(USER_ROLES),
  createAppointment
);

export default router;
