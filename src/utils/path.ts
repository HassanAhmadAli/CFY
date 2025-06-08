import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = path.join(__dirname, "..", "..");
export const publicDir = path.join(rootDir, "public");
export default path;
