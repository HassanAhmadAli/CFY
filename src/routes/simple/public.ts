import express, { Request, Response, NextFunction } from "express";
import authMiddleware from "../../middleware/auth.js";
import { publicDir } from "../../utils/path.js";
import public_csrf from "./public_csrf.js";
const publicRouter = express.Router();
publicRouter.use("/protected", authMiddleware, express.static(publicDir));
publicRouter.use("/", express.static(publicDir));
publicRouter.use(public_csrf);
export { publicRouter };
