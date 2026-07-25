import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

export const protectAdmin = async (req, res, next) => {
  try {
    
    const {jwt:token}= req.cookies
    

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to access this route.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Access denied. Admin privileges required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    
    console.log(error);
    next(error);
  }
};
