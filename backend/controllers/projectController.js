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