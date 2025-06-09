import express, { Request, Response, Router, NextFunction } from "express";
import { UserModel, UserInputSchema, hashPassword } from "../../models/user.js";
import { AppError } from "../../utils/errors.js";
import _ from "lodash";
import { ZodError } from "../../lib/zod.js";
import mongoose, { MongooseError } from "mongoose";
import { sendingMail } from "../../lib/nodemailer.js";
import { env } from "../../utils/env.js";
const signupRoute = express.Router();

signupRoute.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const data = UserInputSchema.parse(req.body);
    let user = new UserModel({
      ..._.omit(data, ["password"]),
      password: await hashPassword(data.password),
    });
    try {
      await user.save();
    } catch (error) {
      if (error instanceof mongoose.mongo.MongoServerError) {
        if (error.code === 11000) {
          return next(new AppError("User already exists", 409));
        }
      }
      return next(error);
    }
    if (env.email) {
      const pin = await user.setVerificationPin();
      const x = await sendingMail({
        from: env.email,
        to: data.email,
        subject: "Confirmation Code to register for CFY Store",
        text: `please enter the following pin in the page to continue<br/>${pin}`,
      });
    } else {
      const pin = await user.setVerificationPinOffline();
    }
    const token = user.getJsonWebToken();
    res.header("x-auth-token", token);
    res
      .status(201)
      .json({ token: token, message: "you need to confirm your email" });
  }
);

export { signupRoute };
