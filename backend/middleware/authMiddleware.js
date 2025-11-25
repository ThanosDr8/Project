//middleware/authMiddleware.js
import jwt from "jsonwebtoken";
export const protect = (req, res, next) => {
  const token  = req.headers.authorized?.split(" ")[1];
  if (!token) return res.status(401).json({message:"Not autherized" });
 
  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch{
    return res.status(401).json({message: "Invalid token"});
  }
};