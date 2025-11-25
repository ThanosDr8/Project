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
