import { Response, Request } from "express";
import { ErrorResponse } from "@server/utils/errorResponse.util";
import User, { IUser } from "@server/models/user.model";
import generateSignedToken from "@server/utils/generateToken.util";
import dayjs from "dayjs";
import UserConstants from "@server/constants/user.constant";
import { Nullable } from "@server/types/common.types";
import Role from "@server/models/role.model";
import Token, { IToken } from "@server/models/token.model";
import ErrorType from "@server/constants/error.constants";

export const login = async (req: Request, res: Response, next: any) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide a valid email and Password", 400)
    );
  }

  try {
    const userCredentials: Nullable<IUser> = await User.findOne(
      { email },
      { active: 1, token: 1 }
    )
      .select("+password")
      .populate({
        path: "token",
        model: Token,
        select: "token -_id",
      })
      .exec();

    if (!userCredentials) {
      return next(
        new ErrorResponse(
          "Invalid Credentials - Check email or password!",
          401,
          ErrorType.INVALID_CREDENTIALS
        )
      );
    }

    // TODO: find better way to do this
    if (userCredentials.token.token.length > 0) {
      return next(
        new ErrorResponse(
          "You are already logged in on another device!",
          403,
          ErrorType.LOGGED_IN_ON_OTHER_DEVICE
        )
      );
    }

    if (!userCredentials.active) {
      return next(
        new ErrorResponse(
          "Inactive account - You must validate your email account first!",
          401,
          ErrorType.INACTIVE_ACCOUNT
        )
      );
    }

    const isMatch: boolean = await userCredentials.matchPassword(password);
    if (!isMatch) {
      return next(
        new ErrorResponse(
          "Invalid Credentials - Check email or password!",
          401,
          ErrorType.INVALID_CREDENTIALS
        )
      );
    }

    const user: Nullable<IUser> = await User.findOne(
      { _id: userCredentials._id },
      UserConstants.USER_RETURN_FIELDS
    )
      .select("+token")
      .populate({ path: "roles", model: Role, select: "name description -_id" })
      .populate({
        path: "token",
        model: Token,
        select: "token refreshToken -_id",
      })
      .exec();

    if (!user) {
      return next(new ErrorResponse("Internal Error", 500));
    }

    // generate tokens for this session
    const token = generateSignedToken(
      user._id,
      process.env.JWT_EXPIRE_LOGIN!,
      process.env.JWT_SECRET!
    );
    const refreshToken = generateSignedToken(
      user._id,
      process.env.JWT_EXPIRE_REFRESH!,
      process.env.JWT_SECRET_REFRESH!
    );

    const userToken: Nullable<IToken> = await Token.findOne({
      userId: user._id,
    });

    if (!userToken) {
      return next(new ErrorResponse("Coudn't find users token!", 500));
    }

    userToken.token = token;
    userToken.refreshToken = refreshToken;
    await userToken.save();

    res.status(200).json({
      success: true,
      user: { ...user.toObject(), id: user._id },
      token: token,
      refreshToken: refreshToken,
      expiration: dayjs().add(30, "minute").format(),
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message, 500));
  }
};

export const logout = async (req: Request, res: Response, next: any) => {
  let userId = req.params.userId;

  if (userId === "")
    return next(new ErrorResponse("Missing userId to perform loggout!", 500));

  try {
    // TODO: for the moment necessary because at the moment to prohibit multiple logins of same user we check if token is set - find better way
    if (userId.includes("@")) {
      const email = userId;
      const user: Nullable<IUser> = await User.findOne({ email });
      if (user) userId = user.id;
      else
        new ErrorResponse(
          "Invalid Credentials - Check email!",
          401,
          ErrorType.INVALID_CREDENTIALS
        );
    }

    const filter = { _id: userId };
    const user: IUser | null = await User.findOne(filter);

    // logout deleted user
    if (!user) {
      res.status(200).json({
        success: true,
        data: "User successfully logged out",
      });
      return;
    }

    // active user gets their token set to empty string
    const token: Nullable<IToken> = await Token.findOne(
      {
        userId: userId,
      },
      { token: 1, refreshToken: 1 }
    );

    if (!token) {
      return next(
        new ErrorResponse(
          "Something wrong happened when trying to logout user!",
          500
        )
      );
    }

    token.token = "";
    token.refreshToken = "";
    await token.save();

    res.status(200).json({
      success: true,
      data: "User successfully logged out",
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message, 500));
  }
};
