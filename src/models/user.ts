import mongoose, { InferSchemaType } from "mongoose";
import { env } from "../utils/env.js";
import jsonwebtoken from "jsonwebtoken";
import _ from "lodash";
import { z } from "../lib/zod.js";
import bcrypt from "bcrypt";
const UserMongooseSchema = new mongoose.Schema(
  {
    name: { type: mongoose.SchemaTypes.String, required: true },
    email: { type: mongoose.SchemaTypes.String, required: true, unique: true },
    password: { type: mongoose.SchemaTypes.String, required: true },
    isVerified: {
      type: mongoose.SchemaTypes.Boolean,
      required: false,
      default: false,
    },
    verificationPin: {
      pin: { type: mongoose.SchemaTypes.Number, required: false },
      expiresAt: { type: Date, required: false },
    },
  },
  { timestamps: true }
);
export interface UserDoc extends InferSchemaType<typeof UserMongooseSchema> {
  getJsonWebToken: () => string;
  setVerificationPin: () => Promise<number>;
}

UserMongooseSchema.methods.getJsonWebToken = function (): string {
  const payLoad = _.pick(this, ["_id"]);
  const jwt_secret: any = env.jwtPrivateKey;
  const token = jsonwebtoken.sign(_.pick(this, "_id"), jwt_secret);
  return token;
};
UserMongooseSchema.methods.setVerificationPin =
  async function (): Promise<string> {
    const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit pin
    this.verificationPin = {
      pin: pin,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Expires in 30 minutes
    };
    await this.save();
    return pin;
  };
export const UserModel = mongoose.model<UserDoc>("User", UserMongooseSchema);

export const UserInputSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
});
export const LoginUserInputSchema = UserInputSchema.pick({
  email: true,
  password: true,
});
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
export async function comparePasswordWithHash(
  password: string,
  hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword);
}
