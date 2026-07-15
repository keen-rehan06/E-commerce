import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
} from "../config/tokens/tokens.config.js";
import { sessionModel } from "../models/session.model.js";
import { sendOtpEmail } from "../config/email/sendOtpMail.js";
import { verifyEmail } from "../config/email/verifyEmail.js";
import { userModel } from "../models/user.model.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { email, password, name, username } = req.body;
    const hashPassword = await bcrypt.hash(password, 12);
    const user = await userModel.create({
      email,
      name,
      username,
      password: hashPassword,
    });
    const token = generateToken(user);
    verifyEmail(token, email);
    const newCreatedUser = await userModel
      .findById(user._id)
      .select("-password -token");
    return res
      .cookie("token", token)
      .status(201)
      .send({ message: "User Cretaed!", success: true, data: newCreatedUser });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: "User Register Failed!", error });
  }
};

export const verficationOfUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found!", success: false });
    user.isVerfied = true;
    await user.save();
    return res
      .status(200)
      .send({ message: "User Verified SuccessFully!!", success: true });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "User Verification Failed!", success: false });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user.isVerfied)
      return res
        .status(401)
        .send({ message: "User not Verifed!", success: false });
    const existingSession = await sessionModel.findOne({ userId: user._id });
    if (existingSession) {
      await sessionModel.deleteOne({ userId: user._id });
    }
    await sessionModel.create({ userId: user._id });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const hashRefreshToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    user.refreshToken = hashRefreshToken;
    await user.save();
    const newCreatedUser = await userModel
      .findById(user._id)
      .select("-password -refreshToken");
    res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .send({ message: "User LoggedIn!", success: true, data: newCreatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Login failed:", error });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await sessionModel.deleteMany({ userId });
    await userModel.findByIdAndUpdate(userId, { isLoggedIn: false });
    return res
      .status(200)
      .send({ message: "User Logout SuccessFully!", success: true });
  } catch (error) {
    console.log(error.message);
    return res
      .status(200)
      .send({ message: "User Logout Failed!", success: false });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).send({
        message: "refreshToken is missing. Please Login!",
        success: false,
      });
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found", success: false });
    const hashedIncomingToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    if (hashedIncomingToken !== user.refreshToken)
      return res
        .status(401)
        .send({ message: "Invalid Refresh Token!", success: false });
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const hashedNewRefreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    user.refreshToken = hashedNewRefreshToken;
    await user.save();
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .send({
        message: "Regenerated RefreshToken SuccessFully!",
        success: false,
      });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      message: "Failed to generate RefreshToken",
      success: false,
      error,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(401)
        .send({ message: "Email is required!", success: false });
    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send({ message: "User not found!", success: false });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const token = generateToken(user);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    sendOtpEmail(otp, email, token);
    const newCreatedUser = await userModel.findById(user._id);
    return res
      .status(200)
      .send({ message: "Otp Sent successFully!", success: true, OTP: otp });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      message: error,
      success: false,
    });
  }
};

export const confirmOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp)
      return res
        .status(401)
        .send({ message: "OTP is required!", success: false });
    const user = await userModel.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found!", success: false });
    if (otp !== user.otp)
      return res.status({ message: "Invalid Otp!", success: false });
    if (otp < 6)
      return res
        .status(401)
        .send({ message: "OTP Must be 6 number.", success: false });
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return res.status(200).send({ message: "OTP! Verified", success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(401).send({ message: error, success: false });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword)
      return res
        .status(401)
        .send({ message: "All fileds Are required!", success: false });
    if (newPassword !== confirmPassword)
      return res
        .status(401)
        .send({ message: "Password Does not match", success: false });
    const user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found!", success: false });
    if (newPassword.length < 6)
      return res
        .status(401)
        .send({ message: "Password at least 6 characters", success: false });
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.token = null;
    await user.save();
    const newUser = await userModel.findById(user._id);
    return res
      .status(200)
      .clearCookie("token")
      .send({ message: "Password Reset SuccessFully!", data: newUser });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Password Reseting Failed!", success: false, error });
  }
};