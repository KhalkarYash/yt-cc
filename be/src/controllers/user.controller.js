import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { allRegex, cookieOptions } from "../constants.js";
import { httpStatusCodes } from "../utils/httpCodes.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      httpStatusCodes[500].code,
      httpStatusCodes[500].message +
        "Something went wrong while generating token"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, userName, password } = req.body;

  if (
    [fullName, email, userName, password].some((field) => field.trim() === "")
  ) {
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

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(
      httpStatusCodes[409].code,
      httpStatusCodes[409].message + ". User already exists"
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". Avatar is required"
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

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      httpStatusCodes[500].code,
      httpStatusCodes[400].message +
        ". Something went wrong while registering the user"
    );
  }

  return res.status(httpStatusCodes[201].code).json({
    data: new ApiResponse(httpStatusCodes[200].code, createdUser),
    message: httpStatusCodes[201].message + ". User created successfully!",
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  if (!email && !userName) {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". Credentials missing"
    );
  }

  if (!allRegex.email.test(email)) {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". Email invalid"
    );
  }

  if (password.trim() === "") {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". All fields are required"
    );
  }

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(
      httpStatusCodes[404].code,
      httpStatusCodes[404].message + ". User doesn't exist"
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(
      httpStatusCodes[401].code,
      httpStatusCodes[401].message + ". Invalid user credentials"
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(httpStatusCodes[200].code)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        httpStatusCodes[200].code,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },

        httpStatusCodes[200].message + ". User logged in successfully!"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(httpStatusCodes[200].code)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
      new ApiResponse(
        httpStatusCodes[200].code,
        {},
        httpStatusCodes[200].message + ". User logged out successfully!"
      )
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken)
    throw new ApiError(
      httpStatusCodes[401].code,
      httpStatusCodes[401].message,
      "request"
    );

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken)
      throw new ApiError(
        httpStatusCodes[401].code,
        httpStatusCodes[401].message
      );

    const user = await User.findById(decodedToken._id);

    if (!user)
      throw new ApiError(
        httpStatusCodes[401].code,
        httpStatusCodes[401].message,
        ". Invalid refresh token"
      );

    if (!(user.refreshToken === incomingRefreshToken))
      throw new ApiError(
        httpStatusCodes[401].code,
        httpStatusCodes[401].message + ". Refresh token is expired or used"
      );

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    user.refreshToken = refreshToken;
    await user.save();

    res
      .status(httpStatusCodes[200].code)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          httpStatusCodes[200].code,
          {
            accessToken,
            refreshToken,
          },
          httpStatusCodes[200].message + ". Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(
      httpStatusCodes[401].code,
      error?.message || "Invalid refresh token."
    );
  }
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;

  if (newPassword !== confPassword) {
    throw new ApiError(400, "New Password and Confirm Password is not same");
  }

  const userId = req?.user?._id;

  const user = await User.findById(userId);
  const isPasswordCorrect = await user.isPasswordCorrect(user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(
      httpStatusCodes[400].code,
      httpStatusCodes[400].message + ". Invalid old password."
    );
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully!"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully!"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required.");
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Account details updated successfully!"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req?.file?.path;

  if (!avatarLocalPath) {
    new ApiError(400, "Avatar file is missing!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    new ApiError(400, "Error while uploading the Avatar!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully!"));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req?.file?.path;

  if (!coverImageLocalPath) {
    new ApiError(400, "Cover Image file is missing!");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    new ApiError(400, "Error while uploading the Cover Image!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover Image updated successfully!")
    );
});
