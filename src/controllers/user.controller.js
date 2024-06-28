import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async(userId)=>{
  try {
    //find user
    const user =await User.findById(userId)
    //generate acesstoken and usertoken
    const acessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save the refresh token to database
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})

    return {acessToken,refreshToken }
    
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating access and refresh token")
  }
}

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

const loginUser = asyncHandler(async (req,res)=>{

  const {email,username,password} = req.body

  if(!username || !email){
    throw new ApiError(400,"Please enter valid username or email");
  }

  const user =await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"User not registered");
  }

  const isValidPassword = await user.isPasswordCorrect(password)
  if(!isValidPassword){
    throw new ApiError(404,"Password is invalid")
  }
  const {acessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    // by this the cookies are modifed only through the server
    httpOnly : true,
    secure : true
  }

  res.status(200).cookie("accesToken",acessToken,options).cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(
      200,
      {
        user : loggedInUser,acessToken,refreshToken
      },
      "User loggedIn Successfully"
    )
  )

})

const logoutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,{
      $set: {
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )

  const options ={
    httpOnly:true,
    secure:true
  }

  res.status(200).clearCookie("acessToken",options).clearCookie("refreshToken",options).json(
    new ApiResponse(200,{},"User Logedout Successfully")
  )
})

export { registerUser,loginUser,logoutUser };
