import ErrorType from "@server/constants/error.constants";
import { ErrorResponse } from "@server/utils/errorResponse.util";
import logger from "@server/utils/logger.util";
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return next(
      new ErrorResponse("token missing", 401, ErrorType.TOKEN_MISSING)
    );

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    console.log("verify token: ", user);
    logger.info(`Verifying token for user:  ${user} - error: ${err}`);

    if (err)
      return next(
        new ErrorResponse("token expired", 403, ErrorType.TOKEN_EXPIRED)
      );

    next();
  });
}
