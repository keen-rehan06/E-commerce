import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    return jwt.sign({id:user._id,role:user.role},{expiresIn:"1h"})
}

export const generateRefreshToken = (user) => {
    return jwt.sign({id:user._id,role:user.role},{expiresIn:"7d"})
}