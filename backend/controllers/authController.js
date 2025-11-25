//authController.js
import User from"../medels/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateToken = (id) => jwt.sign({id},process.env.JWT_SECRET, {expiresIn: "7d"});

export const register = async (req,res) => {
  const { username, email, password } = req.body;
  try{
    const user = await User.create({ username, email, password });
    res.json({ token:generateToken(user._id) });
  } catch (err) {
    res.status(400).jsom({ message:"User exists"});
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user= await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))){
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({token: generateToken(user._id) });
};