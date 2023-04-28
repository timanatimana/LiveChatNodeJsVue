import ErrorType from "@server/constants/error.constants";
import { ErrorResponse } from "@server/utils/errorResponse.util";
import logger from "@server/utils/logger.util";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

export function authenticateSocket(socket: Socket, next: any) {
  const token = socket.handshake.auth.token;
  if (token == null)
    return next(
      new ErrorResponse(
        "socket io has not sent a token",
        401,
        ErrorType.SOCKETIO_TOKEN_MISSING
      )
    );

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    logger.info(`Verifying token for user:  ${user} - error: ${err}`);

    if (err)
      return next(
        new ErrorResponse(
          "token send with socket io has expired",
          403,
          ErrorType.SOCKETIO_TOKEN_EXPIRED
        )
      );

    next();
  });
}
