//taskConroller.js
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