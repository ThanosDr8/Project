import fs from "fs-extra";

const DB_PATH = "./db.json";

export async function readDB() {
  return await fs.readJSON(DB_PATH);
}

export async function writeDB(data) {
  return await fs.writeJSON(DB_PATH, data, { spaces: 2 });
}
