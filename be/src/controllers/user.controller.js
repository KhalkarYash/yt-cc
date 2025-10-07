import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { allRegex } from "../constants.js";
import { httpStatusCodes } from "../utils/httpCodes.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, userName, password } = req.body;

  if (![fullName, email, userName].some((field) => field.trim() === "")) {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". All fields are required"
    );
  }

  if (!allRegex.email.test(email)) {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". Enter a valid email"
    );
  }

  const existingUser = User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(
      httpStatusCodes[409].code,
      httpStatusCodes[409].message + ". User already exists"
    );
  }

  const avatarLocalPath = req.files?.avatar[0].path;

  console.log(req.files);

  const coverImageLocalPath = req.files?.coverImage[0].path;

  if (!avatarLocalPath) {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". Avatar is required"
    );
  }

  if (!avatarLocalPath) {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". Cover image is required"
    );
  }

  const avatarImageRes = await uploadOnCloudinary(avatarLocalPath);

  const coverImageRes = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarImageRes) {
    throw new ApiError(400, "Avatar is missing");
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    password,
    email,
    avatar: avatarImageRes.url,
    coverImage: coverImageRes?.url || "",
  });

  const createdError = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdError) {
    throw new ApiError(
      httpStatusCodes[500].code,
      httpStatusCodes[400].message +
        ". Something went wrong while registering the user"
    );
  }

  return res
    .status(httpStatusCodes[201].code)
    .json(
      new ApiResponse(
        httpStatusCodes[200].code,
        user,
        httpStatusCodes[201].message + ". User created successfully!"
      )
    );
});
