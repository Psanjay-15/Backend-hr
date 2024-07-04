import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  upadateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refreshToken").post(refreshAccessToken);
router.route("/currentuser").get(verifyJWT, getCurrentUser);
router.route("/changepassword").post(verifyJWT, changeCurrentPassword);
router.route("/updatedetails").patch(verifyJWT, updateAccountDetails);

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), upadateAvatar);

router
  .route("/coverImage")
  .patch(verifyJWT, upload.single("/coverImage"), updateCoverImage);

router.route("/history").get(verifyJWT, getWatchHistory);
export default router;
