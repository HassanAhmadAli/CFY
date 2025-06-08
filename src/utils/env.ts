import dotenv from "dotenv";
dotenv.config({});
import { z } from "../lib/zod.js";
import { prettifyError } from "zod/v4";
const envSchema = z
  .object({
    MONGODB_URI: z.string().default("mongodb://localhost:27017"),
    jwtPrivateKey: z
      .string()
      .default(
        "THIS_SHOULD_NEVER_BE_NULL_IN_REAL_APPLICATION_UNDER_ANY_CIRCUMSTANCE"
      ),
    PORT: z.string().default("3008"),
    NODE_ENV: z.enum(["production", "development"]).default("production"),
  })
  .loose();

const { success, error, data } = envSchema.safeParse(process.env);

if (!success || data == undefined) {
  throw new Error(`Invalid environment variables:\n${prettifyError(error)}`);
}

export const env = data;
