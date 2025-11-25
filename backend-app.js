//server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRouts from  "./routes/authRoutes.js";
import taskRouts from  "./routes/taskRouts.js";
import projectRouts from  "./routes/projectRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log('server running on port ${PORT}'));

//config/db.js
import mongoose from "mongoose";
const connectDB = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log ("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
export default connectDB

//User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new monpgoose.Schema({
  username: { type: String, requierd: tue, unique: true},
  email: { type: String, required: true, unique: true},
  password: { type: String,required: true}
});

userSchema.pre("save", async function (next){
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
export default mongoose.model("User", userSchema);

//Task.js
import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ["todo","in-progress","done"],
    default: "todo"
  },
  priority: {type: String, enum: ["low","medium","high"],default:"meium" },
  dueDate:Date,
  user:{type: mongoose.Schema.Types.ObjectID, ref:"User" },
  project: {type: mongoose.Schema.Types.ObjectID, ref:"Project" }
},{ timestamps:true});
export default mongoose.model("Task",taskSchema);

//Project.js
import mongoose from "mongoose";
const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
export default mongoose.model("Project", projectSchema);

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

//task.Controller.js
import Task from "../medels/task.js";
export const createTask = async (req, res) => {
  const task = await Task.create({...req.body, user: req.user});
  res.json(task);
};

export const getTask = async (req, res) => {
  const task = await Task.find({user: req.user});
  res.json(task);
};

export const udateTask = async (req, res) => {
  const task = await Task.findByIDAndUpdate(req.params.id, req.body, { new: true});
  res.json(task);
};

export const deleteTask = async (req,res) => {
  await Task.findByIDAndDelete(req.params.id);
  res.json({ massage: "Task deleted"});
};

//projectController.js
import Project from "../models/Project.js";

export const createProject = async (req, res) => {
  const project = await Project.create({...req.budy, user: req.user });
  res.json(project);
};

export const getProjects = async (req, res) => {
  const projects = await Project.find({ user: req.user });
  res.json(projects);
};

//authRoutes.js
import express from "express";
import { register,login } from"..controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("login", login);

export default router;

//taskRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/taskController.js";

const router = express.Router();
router.use(protect);
router.post("/", createTask);
router.get("/",getTask);
router.put("/:id",updateTask);
router.delete("/:id",deleteTask);

export default router;

//projectRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createProject, getProject } from "../controllers/projectController.js";

const router = express.Router();
router.use(protect);
router.post("/", createProject);
router.get("/",getProjects);

export default router;