import { Response, Request } from "express";
import User, { IUser } from "@server/models/user.model";
import { ErrorResponse } from "@server/utils/errorResponse.util";
import sendEmail from "@server/utils/emailSender.util";
import * as crypto from "crypto";
import dayjs from "dayjs";
import Token, { IToken } from "@server/models/token.model";

export const register = async (req: Request, res: Response, next: any) => {
  const { username, email, password } = req.body;

  try {
    // create user but inactive in DB
    const user: IUser = await User.create({
      username,
      email,
      password,
    });

    // create token for user
    const newToken: IToken = await Token.create({
      userId: user._id,
    });
    await newToken.save();
    user.token = newToken;

    // send activate account email
    const validateEmailToken = user.getValidateEmailToken();
    await user.save();

    const clientApiPort = process.env.CLIENT_API_PORT || 4000;
    const baseUrlClient = process.env.BASE_URL_CLIENT || "http://localhost:";

    const validateEmailUrl = `${baseUrlClient}${clientApiPort}/verifyaccount?userId=${user._id}&validateEmailToken=${validateEmailToken}`;
    const message = `
        <h1> You registered at ----addev - live chat---- </h1>
        <p> Please go to this link to verify your account </p>
        <a href=${validateEmailUrl} clicktracking=off>${validateEmailUrl}</a> 
        `;

    // TODO: if email not send, error handling needed for frontend!
    try {
      await sendEmail({
        to: user.email,
        text: message,
        subject: "Registration at ----addev - live chat----",
      });
    } catch (error) {
      await user.deleteOne();

      return next(
        new ErrorResponse("Validate account email could not be sent", 500)
      );
    }

    // respond successfully to frontend
    res.status(201).json({
      success: true,
      data: `User account registration for ${user.email} successful - activation email sent`,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      next(
        new ErrorResponse(
          `Email or username already taken - ${error.message}`,
          409
        )
      );
    }
    next(new ErrorResponse(`Internal Server Error ${error.message}`, 500));
  }
};

export const activateAccount = async (
  req: Request,
  res: Response,
  next: any
) => {
  const validateEmailToken = crypto
    .createHash("sha256")
    .update(req.params.validateEmailToken)
    .digest("hex");

  try {
    // find user
    const user: IUser | null = await User.findOne({
      _id: req.params.userId,
      validateEmailToken,
      validateEmailExpire: { $gt: dayjs().format() },
    });

    if (!user) {
      return next(
        new ErrorResponse("User account not found or invalid token", 400)
      );
    }

    // activate
    user.active = true;
    user.validateEmailToken = undefined;
    user.validateEmailExpire = undefined;
    await user.save();

    res.status(201).json({
      success: true,
      data: `User account activation for ${user.email} successful`,
    });
  } catch (error) {
    next(error);
  }
};
