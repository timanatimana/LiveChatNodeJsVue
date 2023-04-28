import User, { IUser } from "@server/models/user.model";
import UserConstants from "@server/constants/user.constant";
import { Nullable } from "@server/types/common.types";
import ChatMsg, { IChatMsg } from "@server/models/chatmsg.model";

export interface IOnlineUser {
  userId: string;
  socketId: string;
  username: string;
  avatarstyle: string;
  avatarseed: number;
}

export type OnlineUserData = Omit<
  IOnlineUser,
  "username" | "avatarstyle" | "avatarseed"
>;

export type IOnlineUsers = IOnlineUser[];

export const onlineUserIds: OnlineUserData[] = [];

export const addUser = async (newUserData: OnlineUserData) => {
  const exist = onlineUserIds.find(
    (ou) => ou.socketId === newUserData.socketId
  );
  if (exist) {
    return { error: "User with this socket id already exist" };
  }

  const sameUser = onlineUserIds.find((ou) => ou.userId === newUserData.userId);
  if (sameUser) {
    return { error: "A user with the same id is already online!" };
  }

  onlineUserIds.push(newUserData);
  const newUser: Nullable<IOnlineUser> = await findUser(newUserData);

  return { newUser };
};

export const getOnlineUsers = async (): Promise<IOnlineUsers> => {
  const onlineUsers: IOnlineUsers = [];

  // always get updated information on username and useravatar from DB
  for (const userData of onlineUserIds) {
    const user: Nullable<IOnlineUser> = await findUser(userData);
    if (user) onlineUsers.push(user);
  }

  return onlineUsers;
};

// needed for user avatarpicture
export const getChatSessionUsers = async (
  sessionId: string
): Promise<IOnlineUsers> => {
  const onlineUsers = await getOnlineUsers();
  const chatSessionUsers: IOnlineUsers = onlineUsers;

  //TODO: find out how it works with distinct
  const allChatMsgs: IChatMsg[] = await ChatMsg.find(
    { session: sessionId },
    { user: 1 }
  ).populate("user", "name id");

  if (allChatMsgs.length > 0) {
    // ES6 way to get distinct values  filter(onlyUnique)
    //const userIds = [...new Set(allChatMsgs.map((msg) => msg.user.id))];
    const userIds = allChatMsgs
      .map((msg) => msg.user.id)
      .filter((value, index, array) => array.indexOf(value) === index);

    // always get updated information on username and useravatar from DB
    for (const id of userIds) {
      if (onlineUsers.findIndex((ou) => ou.userId === id) === -1) {
        const user: Nullable<IOnlineUser> = await findSessionUser(id);
        if (user) chatSessionUsers.push(user);
      }
    }
  }

  return chatSessionUsers;
};

export const getUser = async (
  socketId: string
): Promise<Nullable<IOnlineUser>> => {
  const userData = onlineUserIds.find((id) => id.socketId === socketId);
  if (userData) {
    return await findUser(userData);
  }
  return null;
};

export const removeUser = (socketId: string) => {
  const index = onlineUserIds.findIndex((id) => id.socketId === socketId);
  if (index !== -1) {
    return onlineUserIds.splice(index, 1)[0];
  }
};

// get userdata from DB
const findUser = async (
  userData: OnlineUserData
): Promise<Nullable<IOnlineUser>> => {
  let onlineUser: Nullable<IOnlineUser> = null;

  const user: Nullable<IUser> = await User.findOne(
    {
      _id: userData.userId,
    },
    UserConstants.ONLINEUSER_RETURN_FIELDS
  );

  if (user)
    onlineUser = {
      ...user.toObject(),
      userId: user._id,
      socketId: userData.socketId,
    };

  return onlineUser;
};

// TODO: combine this method with method findUser above
const findSessionUser = async (
  userId: string
): Promise<Nullable<IOnlineUser>> => {
  let onlineUser: Nullable<IOnlineUser> = null;

  const user: Nullable<IUser> = await User.findOne(
    {
      _id: userId,
    },
    UserConstants.ONLINEUSER_RETURN_FIELDS
  );

  if (user) onlineUser = { ...user.toObject(), userId: user._id, socketId: "" };

  return onlineUser;
};
