import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const vt = async function (req, res, next) {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("token: ", token);
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const person = await User.findById(decoded._id);
    if (!person) {
      return res.status(401).json({ message: "Access Token Rejected" });
    }

    req.user = person;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token or token expired" });
  }
};
