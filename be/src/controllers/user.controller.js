import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { allRegex } from "../constants.js";
import { httpStatusCodes } from "../utils/httpCodes.js";

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

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(httpStatusCodes[200].code)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(httpStatusCodes[200].code)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        httpStatusCodes[200].code,
        {},
        httpStatusCodes[200].message + ". User logged out successfully!"
      )
    );
});
