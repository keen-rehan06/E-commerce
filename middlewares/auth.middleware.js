import { userModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUserChecks = async (req, res, next) => {
  try {
    const { email, name, username, password } = req.body;
    if (!email || !name || !username || !password)
      return res
        .status(401)
        .send({ message: "All fields are required!", success: false });
    const user = await userModel.findOne({ $or: [email, username] });
    if (user)
      return res
        .status(401)
        .send({ message: "User already exist!", success: false });
    if (
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof username !== "string"
    )
      return res
        .status(401)
        .send({ message: "All filed must be string!", success: false });
    if (name.trim().length < 3 || username.trim().length < 3)
      return res
        .status(401)
        .send({
          message: "name and username must be atLeast 3 characters.",
          success: false,
        });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res
        .status(400)
        .send({ send: "Invalid Email Format!", success: false });
    if (password.length < 6)
      return res
        .status(401)
        .send({
          message: "Password must be at least 6 characters long!",
          success: false,
        });
    if (password.length > 12)
      return res
        .status(401)
        .send({ message: "Too long password!", success: false });
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Internal Server Error:", error });
  }
};

export const loginUserChecks = async (req,res,next) => {
  try {
    const {email,password} = req.body;
    if(!email || !password) return res.status(401).send({message:"All fields are required",success:false});
    const user = await userModel.findOne({email});
    if(!user) return res.status(404).send({message:"User Not Found!",success:false});
    const comparePassword = await bcrypt.compare(password,user.password);
    if(!comparePassword) return res.status(401).send({messgae:"Invalid Password!",success:false});
    if(typeof email !== "string" || typeof password !== "string") return res.status(401).send({message:"All fields must be string",success:false});
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) return res.status(400).send({message:"Invalid Email Format!",success:false});
    next()
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({message:"Internal Server Error",error});
  }
}

export const isLoggedIn = async (req,res,next) => {
  let token;
  const authHeader = req.headers.authorization;
  if(req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }else if(authHeader && authHeader.startsWith("Bearer ")){
    token = authHeader.split(" ")[1];
  }
  if(!token) return res.status(404).send({message:"Plaese! login first.",success:false});
  try {
    const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    if(!decoded) return res.status(401).send({message:"Invalid Or Expired Token."});
    req.user = decoded;
    next()
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({message:"Internal Server Error",error});
  }
}

export const authorize = (...roles) => {
   return (req,res,next) => {
    if(!roles.includes(req.user.role)) return res.status(400).send({message:"Access Denied!",success:false});
    next()
   }
}