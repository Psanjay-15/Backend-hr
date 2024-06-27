import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // return res.status(200).json({
  //   message: "sanjay",
  // });

  // this imformation is taken from the frontend
  const { username, fullname, email, password } = req.body;
  console.log("email:", email);

  //this is to check if the data points are empty
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  // find the username or email if alreday present in the db
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // took the local path
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coveImageLocalPath = req.files?.coverImage[0]?.path;

  //the below is done if the error occurs while uploading empty value
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  }
  console.log(avatarLocalPath)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file path is require");
  }
  // to upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //if avatar is not uploaded on the cloudinary
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // if all the things are correct then uplaod in the db

  const user = await User.create({
    fullname,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // to check if user is created
  // _id is the by default given by the mongodb
  // this will be removed
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //if all is fine then send the respose
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

export { registerUser };
