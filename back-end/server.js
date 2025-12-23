import express from "express";
import cors from "cors";

import tasksRouter from "./routes/tasks.js";
import groupsRouter from "./routes/groups.js";
import usersRouter from "./routes/users.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
