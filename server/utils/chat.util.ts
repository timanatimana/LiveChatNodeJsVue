import { Nullable } from "@server/types/common.types";
import ChatSession, { IChatSession } from "@server/models/chatsession.model";
import ChatMsg, { IChatMsg } from "@server/models/chatmsg.model";
import dayjs from "dayjs";

export interface IClientChatMessage {
  id: string;
  user: string;
  message: string;
  createdAt: string;
}
export type IClientChatMessages = IClientChatMessage[];

export interface IClientChatSession {
  id: string;
  createdAt: string;
}

// TODO: maybe use this instead of query to DB
export let currentChatSession: Nullable<IChatSession> = null;

export const createChatMsg = async (
  chatMsg: IClientChatMessage
): Promise<Nullable<IClientChatMessage>> => {
  const activeSession: Nullable<IChatSession> = await ChatSession.findOne({
    active: true,
  });

  if (activeSession) {
    const newChatMsg: IChatMsg = await ChatMsg.create({
      message: chatMsg.message,
      user: chatMsg.user,
      session: activeSession.id,
    });

    return newChatMsg.toObject();
  }

  return null;
};

export const getActiveChatSession = async (): Promise<IClientChatSession> => {
  // to avoid multiple active sessions check if there already is one and return this one if exists
  const activeSession: Nullable<IChatSession> = await ChatSession.findOne({
    active: true,
  });

  if (!activeSession) {
    const newSession: IChatSession = await ChatSession.create({
      active: true,
      closedAt: "",
    });

    currentChatSession = newSession;
    return newSession.toObject();
  }

  currentChatSession = activeSession;
  return activeSession.toObject();
};

export const closeChatSession = async (): Promise<boolean> => {
  const activeSession: Nullable<IChatSession> = await ChatSession.findOne({
    active: true,
  });

  if (activeSession) {
    activeSession.active = false;
    activeSession.closedAt = dayjs().toISOString();
    await activeSession.save();
    return true;
  }

  return false;
};

export const getAllChatMsgs = async (): Promise<IClientChatMessages> => {
  const activeSession: Nullable<IChatSession> = await ChatSession.findOne({
    active: true,
  });

  if (!activeSession) {
    return [];
  }

  const allChatMsgs: IChatMsg[] = await ChatMsg.find({
    session: activeSession.id,
  });

  return allChatMsgs.map((msg) => {
    return msg.toObject();
  });
};
