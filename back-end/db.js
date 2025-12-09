import fs from "fs-extra";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, "db.json");

export async function readDB() {
  return await fs.readJSON(DB_PATH);
}

export async function writeDB(data) {
  return await fs.writeJSON(DB_PATH, data, { spaces: 2 });
}