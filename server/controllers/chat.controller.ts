import { Response, Request } from "express";
import { ErrorResponse } from "@server/utils/errorResponse.util";
import ChatMsg, { IChatMsg } from "@server/models/chatmsg.model";
import User, { IUser } from "@server/models/user.model";

// NOT IN USE - Messages get created by socket io

export const getChatMessages = async (
  req: Request,
  res: Response,
  next: any
) => {
  try {
    const messages: IChatMsg[] = await ChatMsg.find();

    res.status(200).json({
      success: true,
      messages: messages,
    });
  } catch (error: any) {
    next(new ErrorResponse(`Internal Server Error ${error.message}`, 500));
  }
};

export const createChatMessage = async (
  req: Request,
  res: Response,
  next: any
) => {
  const { message, userId } = req.body;
  try {
    const user: IUser | null = await User.findOne({
      _id: userId,
    });

    if (!user) {
      return next(new ErrorResponse("User not found", 400));
    }

    const newMsg: IChatMsg = await ChatMsg.create({
      message: message,
      user: user,
    });

    await newMsg.save();

    res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    next(new ErrorResponse(`Internal Server Error ${error.message}`, 500));
  }
};
