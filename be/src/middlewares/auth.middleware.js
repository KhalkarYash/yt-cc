import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatusCodes } from "../utils/httpCodes.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token)
      throw new ApiError(
        httpStatusCodes[401].code,
        httpStatusCodes[401].message
      );

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(
        httpStatusCodes[401].code,
        httpStatusCodes[401].message + ". Invalid access token"
      );
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(
      httpStatusCodes[401].code,
      httpStatusCodes[401].message + error?.message || "Invalid access token"
    );
  }
});
