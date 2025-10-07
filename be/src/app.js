import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { SIZE_LIMIT } from "./constants.js";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: SIZE_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);

export { app };
