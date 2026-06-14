import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";

export const getCheckoutSession = async (req, res) => {
  try {
    //get currently booked doctor
    const doctor = await Doctor.findById(req.params.doctorId);
    const user = await User.findById(req.userId);

    // Check if doctor and user exist
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if STRIPE_SECRET_KEY is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_change_me") {
      return res.status(500).json({ 
        success: false, 
        message: "Stripe not configured. Please set STRIPE_SECRET_KEY in .env" 
      });
    }

    // console.log("Doctor ticket price:", doctor.ticketPrice);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
      cancel_url: `${req.protocol}://${req.get("host")}/doctors/${doctor.id}`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: doctor.ticketPrice * 100,
            product_data: {
              name: doctor.name,
              description: doctor.bio || "Doctor Appointment",
              images: [doctor.photo] || ["https://via.placeholder.com/200"],
            },
          },
          quantity: 1,
        },
      ],
    });

    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      session: session.id,
    });
    await booking.save();
    res
      .status(200)
      .json({ success: true, message: "Successfully paid", session });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    console.error("Full Error:", err);
    res
      .status(500)
      .json({ 
        success: false, 
        message: "Error creating checkout session",
        error: err.message // Include error detail for debugging
      });
  }
};
