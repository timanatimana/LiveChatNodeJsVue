import { Response, Request } from "express";
import { ErrorResponse } from "@server/utils/errorResponse.util";
import User, { IUser } from "@server/models/user.model";
import * as crypto from "crypto";
import sendEmail from "@server/utils/emailSender.util.js";
import dayjs from "dayjs";

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: any
) => {
  const { email } = req.body;

  try {
    const user: IUser | null = await User.findOne({ email: email });
    if (!user) {
      return next(
        new ErrorResponse(
          `Email could not be sent - email unknown: ${email}`,
          404
        )
      );
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();

    const clientApiPort = process.env.CLIENT_API_PORT || 4000;
    const baseUrlClient = process.env.BASE_URL_CLIENT || "http://localhost:";

    const resetUrl = `${baseUrlClient}${clientApiPort}/passwordreset?resetToken=${resetToken}`;
    const message = `
        <h1> You have requested a password reset for ----addev - live chat----</h1>
        <p> Please go to this link to reset your password </p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a> 
        `;

    try {
      await sendEmail({
        to: user.email,
        text: message,
        subject: "Password reset for ----addev - live chat----",
      });
      res.status(200).json({
        success: true,
        data: "Forgot password email sent",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return next(
        new ErrorResponse("Forgot password email could not be sent", 500)
      );
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: any) => {
  const { password } = req.body;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  try {
    const user: IUser | null = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: dayjs().format() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(201).json({
      success: true,
      data: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};
