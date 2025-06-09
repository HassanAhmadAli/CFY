import express, { Request, Response, Router, NextFunction } from "express";
import { UserModel, UserInputSchema, hashPassword } from "../models/user.js";
import { AppError } from "../utils/errors.js";
import _ from "lodash";
import { z, ZodError } from "../lib/zod.js";
import mongoose, { MongooseError } from "mongoose";
import { sendingMail } from "../lib/nodemailer.js";
import { env } from "../utils/env.js";
const signupRoute = express.Router();

signupRoute.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = UserInputSchema.parse(req.body);
      const user = new UserModel({
        ..._.omit(data, ["password"]),
        password: await hashPassword(data.password),
      });
      const newUser = await user.save();
      const pin = await user.setVerificationPin();
      try {
        const x = await sendingMail({
          from: env.email,
          to: data.email,
          subject: "Confirmation Code to register for CFY Store",
          text: `please enter the following pin in the page to continue<br/>${pin}`,
        });
        console.log(x);
      } catch (e) {
        console.error(e);
      }
      const token = newUser.getJsonWebToken();
      res.header("x-auth-token", token).status(201).json({ token: token });
    } catch (error: any) {
      if (error instanceof mongoose.mongo.MongoServerError) {
        if (error.code === 11000) {
          return next(new AppError("User already exists", 409));
        }
      }
      if (error instanceof ZodError) {
        return next(AppError.fromZodError(error, 400));
      }
      next(new AppError(error.message, 500));
    }
  }
);
export { signupRoute };
