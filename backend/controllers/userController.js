import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary';
import stripe from "stripe";
import Razorpay from 'razorpay';

// Stripe Initialization
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

// Razorpay Safe Initialization
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("⚠️ Razorpay is not configured. Skipping initialization.");
}

// Register User
const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.json({ success: false, message: 'All fields are required' });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: 'Invalid Email' });

    if (password.length < 6)
      return res.json({ success: false, message: 'Password must be at least 6 characters' });

    const existUser = await userModel.findOne({ email });

    if (existUser)
      return res.json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Login User
const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Apply Doctor
const applyDoctorController = async (req, res) => {
  try {
    const doctor = await doctorModel.create(req.body);
    res.json({ success: true, message: 'Applied Successfully', doctor });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Book Appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, userId, date, time, amount } = req.body;

    const appointment = await appointmentModel.create({
      doctorId, userId, date, time, amount
    });

    res.json({ success: true, message: 'Appointment Booked', appointment });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Payment Razorpay
const paymentRazorpay = async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.json({ success: false, message: 'Razorpay is not configured' });
    }

    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: 'Appointment Cancelled or not found' });
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY || 'INR',
      receipt: appointmentId,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Razorpay
const verifyRazorpay = async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.json({ success: false, message: 'Razorpay is not configured' });
    }

    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === 'paid') {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: 'Payment Failed' });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Payment Stripe
const paymentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: 'Appointment Cancelled or not found' });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: process.env.CURRENCY || 'INR',
          product_data: {
            name: "Doctor Appointment",
          },
          unit_amount: appointmentData.amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: process.env.CLIENT_URL,
      cancel_url: process.env.CLIENT_URL,
    });

    res.json({ success: true, url: session.url });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUserController,
  loginUserController,
  applyDoctorController,
  bookAppointment,
  paymentRazorpay,
  verifyRazorpay,
  paymentStripe
};
