import express from "express";
import { register, activateAccount } from "../controllers/register.controller";
import { logout, login } from "../controllers/login.controller";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/password.controller";
import { refreshAccessToken } from "@server/controllers/refreshToken.controller";

const router = express.Router();

//routes
router.route("/register").post(register);
router
  .route("/activateaccount/:userId/:validateEmailToken")
  .post(activateAccount);
router.route("/login").post(login);
router.route("/logout/:userId").post(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resetToken").post(resetPassword);
router.route("/refreshtoken/").post(refreshAccessToken);

export default router;
