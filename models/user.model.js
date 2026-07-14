import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
 ],
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    type: String,
    default: null,
  },
  isVerfied: {
    type: Boolean,
    default: false,
  },
  isloggedIn: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  cartProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "role",
  },
  purchaseHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "purchase",
    },
  ],
  order: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "review",
    },
  ],
});

export const userModel = new mongoose.model("user",userSchema);