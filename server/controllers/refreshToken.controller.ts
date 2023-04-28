import ErrorType from "@server/constants/error.constants";
import Token, { IToken } from "@server/models/token.model";
import { Nullable } from "@server/types/common.types";
import { ErrorResponse } from "@server/utils/errorResponse.util";
import generateSignedToken from "@server/utils/generateToken.util";
import logger from "@server/utils/logger.util";
import dayjs from "dayjs";
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken === null || requestToken.length === 0) {
    return next(
      new ErrorResponse(
        "no refreshtoken present",
        403,
        ErrorType.NO_REFRESHTOKEN_PRESENT
      )
    );
  }

  jwt.verify(
    requestToken,
    process.env.JWT_SECRET_REFRESH as string,
    async (err: any, user: any) => {
      logger.info(`Verifying refreshtoken for user: ${user} - result: ${err}`);

      if (err)
        return next(
          new ErrorResponse(
            "refreshtoken expired",
            403,
            ErrorType.REFRESHTOKEN_EXPIRED
          )
        );

      // create new token and send back
      const token = generateSignedToken(
        user._id,
        process.env.JWT_EXPIRE_LOGIN!,
        process.env.JWT_SECRET!
      );
      const userToken: Nullable<IToken> = await Token.findOne({
        userId: user._id,
      });
      if (!userToken) {
        return next(new ErrorResponse("Coudn't find users token!", 500));
      }
      userToken.token = token;
      await userToken.save();

      res.status(201).send({
        sucess: true,
        token: token,
        expiration: dayjs().add(15, "minute").format(),
      });

      next();
    }
  );
};
