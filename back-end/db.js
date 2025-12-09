import fs from "fs-extra";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../db.json"); // <-- FIXED

export async function readDB() {
  return await fs.readJSON(DB_PATH);
}

export async function writeDB(data) {
  return await fs.writeJSON(DB_PATH, data, { spaces: 2 });
}