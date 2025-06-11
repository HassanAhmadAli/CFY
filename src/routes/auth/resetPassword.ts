import { Router, Request, Response, NextFunction } from "express";
import { UserModel, hashPassword } from "../../models/user.js";
import { AppError } from "../../utils/errors.js";
import _ from "lodash";
import csurf from "csurf";
import { env } from "../../utils/env.js";
import { z, ZodError } from "../../lib/zod.js";
const ResetPasswordRoute = Router();
const csrf = csurf({
  ignoreMethods: ["POST"],
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  },
});
ResetPasswordRoute.use(csrf);
const ResetPasswordInput = z.object({
  email: z.email(),
  pin: z.number(),
  password: z.string().min(8),
});
const errorMessage = "Email or Pin Code is Incorrect";
ResetPasswordRoute.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const data = ResetPasswordInput.parse(req.body);
    const user = await UserModel.findOne({ email: data.email });
    if (!user) {
      return next(new AppError(errorMessage, 409));
    }
    if (!user.isVerified) {
      return next(new AppError(errorMessage, 500));
    }
    if (!user.verificationPin || !user.verificationPin.pin) {
      return next(new AppError(errorMessage, 500));
    }
    if (!user.verificationPin?.pin) {
      return next(new AppError(errorMessage, 500));
    }
    user.password = await hashPassword(data.password);
    user.verificationPin = null;
    await user.save();
    res.status(200).json({ message: "Password Changed Successfully" });
  }
);

export { ResetPasswordRoute };
