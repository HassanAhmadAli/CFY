import express, { Request, Response, NextFunction } from "express";
import {signupRoute} from "./routes/signup.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {loginRoute} from "./routes/login.js";
import { env } from "./utils/env.js";
import {publicRouter} from "./routes/public.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
const app = express();
const corsOptions = {
  origin: /^.*/,
};
app.use(cors(corsOptions));
// app.use(async (req, res, next) => {
//   setTimeout(next, 1);
// });
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: env.jwtPrivateKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);
app.use("/api/signup", signupRoute);
app.use("/api/login", loginRoute);
app.use("/api/login", loginRoute);

app.use("/public", publicRouter);
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(req.url);
    next();
  }
);
app.use(errorHandler);
export { app };
