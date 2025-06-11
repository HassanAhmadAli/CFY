import express, { Request, Response, Router, NextFunction } from "express";
import { UserModel } from "../../models/user.js";
import { AppError } from "../../utils/errors.js";
import _ from "lodash";
import { z, ZodError } from "../../lib/zod.js";
import csurf from "csurf";
import { env } from "../../utils/env.js";
const requestVerificationPin = express.Router();
const csrf = csurf({
  ignoreMethods: ["POST"],
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  },
});
const ResetPasswordInput = z.object({
  email: z.email(),
});
requestVerificationPin.use(csrf);
requestVerificationPin.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const data = ResetPasswordInput.parse(req.body);
    const user = await UserModel.findOne({
      email: data.email,
    }).exec();
    if (!user) {
      return next(new AppError("User Does Not Exist", 404));
    }
    if (!user.verificationPin?.pin) {
      await user.setVerificationPin();
    }
    user.sendVerificationEmail();
    await user.save();
    res.status(200).json({ message: "Pin Code Sent" });
    return;
  }
);

export { requestVerificationPin };
