import express, { Request, Response, Router, NextFunction } from "express";
import { UserModel } from "../models/user.js";
import { AppError } from "../utils/errors.js";
import _ from "lodash";
import { z, ZodError } from "../lib/zod.js";
import csurf from "csurf";
import { env } from "../utils/env.js";
const authRoutes = express.Router();
const csrf = csurf({
  ignoreMethods: ["POST"],
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  },
});
const ConfirmDataInput = z.object({
  email: z.email(),
  pin: z.number(),
});
authRoutes.use(csrf);
authRoutes.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const data = ConfirmDataInput.parse(req.body);
    const user = await UserModel.findOne({
      email: data.email,
    }).exec();
    if (!user) {
      return next(new AppError("User Does Not Exist", 404));
    }
    if (!user.verificationPin) {
      return next(new AppError("No verification PIN found", 400));
    }
    if (user.verificationPin.pin !== data.pin) {
      return next(new AppError("Verification PIN Incorrect", 400));
    }
    const now = new Date(Date.now());
    const expiryDate = user.verificationPin.expiresAt;
    if (!expiryDate || now > expiryDate) {
      return next(new AppError("Verification PIN has expired", 401));
    }
    user.verificationPin = null;
    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: "User Verified Successfully" });
    return;
  }
);

authRoutes.use(
  (error: Error | AppError, req: Request, res: any, next: NextFunction) => {
    if (error instanceof ZodError) {
      return next(AppError.fromZodError(error, 400));
    }
    return next(new AppError(error.message, 500));
  }
);
export default authRoutes;
