import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
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
  userController.registerUser
);
router.route("/login").post(userController.loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, userController.logoutUser);
router
  .route("/refresh-token")
  .post(verifyJWT, userController.refreshAccessToken);
router
  .route("/change-password")
  .post(verifyJWT, userController.changeCurrentPassword);
router.route("/current-user").get(verifyJWT, userController.getCurrentUser);
router
  .route("/update-account")
  .patch(verifyJWT, userController.updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), userController.updateUserAvatar);
router
  .route("/cover-image")
  .patch(
    verifyJWT,
    upload.single("coverImage"),
    userController.updateUserCoverImage
  );

export default router;
