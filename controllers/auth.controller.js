import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
} from "../config/tokens/tokens.config.js";
import { sessionModel } from "../models/session.model.js";
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
    return res.status(500).send({ message: "User Verification Failed!", success: false });
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

export const logoutUser = async(req,res) => {
  try {
    const userId = req.user.id;
    await sessionModel.deleteMany({userId});
    await userModel.findByIdAndUpdate(userId,{isLoggedIn:false});
    return res.status(200).send({message:"User Logout SuccessFully!",success:true})
  } catch (error) {
    console.log(error.message);
    return res.status(200).send({message:"User Logout Failed!",success:false})
  }
}
export const refreshAccessToken = async(req,res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
      if(!refreshToken) return res.status(401).send({message:""})
  } catch (error) {
    
  }
}