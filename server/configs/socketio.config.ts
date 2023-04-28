import logger from "@server/utils/logger.util";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { authenticateSocket } from "@server/middlewares/authSocketIo";
import {
  addUser,
  getChatSessionUsers,
  getOnlineUsers,
  IOnlineUser,
  IOnlineUsers,
  removeUser,
} from "@server/utils/onlineUsers.util";
import {
  closeChatSession,
  createChatMsg,
  getActiveChatSession,
  getAllChatMsgs,
  IClientChatMessage,
  IClientChatMessages,
  IClientChatSession,
} from "@server/utils/chat.util";
import { Nullable } from "@server/types/common.types";

interface ServerToClientEvents {
  activeChatSession: (session: IClientChatSession) => void;
  closedChatSession: () => void;
  typing: (userId: string) => void;
  stopTyping: (userId: string) => void;
  welcome: (newUser: IOnlineUser) => void;
  errorOnWelcome: (error: string) => void;
  getOnlineUsers: (allOnlineUsers: IOnlineUsers) => void;
  newChatMessage: (message: IClientChatMessage) => void;
  getAllChatMsgs: (chatMsgs: IClientChatMessages) => void;
  getAllChatSessionUsers: (chatMsgs: IOnlineUsers) => void;
}

interface ClientToServerEvents {
  getAllChatMsgs: (chatMsgs: IClientChatMessages) => void;
  createChatMessage: (message: IClientChatMessage) => void;
  typing: (userId: string) => void;
  stopTyping: (userId: string) => void;
  getOnlineUsers: () => void;
  updatedOnlineUser: () => void;
}

const initializeSocketIO = (server: HttpServer) => {
  
const baseUrlClient = process.env.BASE_URL_CLIENT || "http://localhost:";
const clientApiPort = process.env.CLIENT_API_PORT || 4000;

  const corsOptions = {
    origin: `${baseUrlClient}${clientApiPort}`,
  };

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: corsOptions,
  });

  io.use(authenticateSocket);

  io.on("connection", async function (socket) {
    const userId = (socket.handshake.query.userid as string) || "";
    logger.info(
      `A user with socketId: ${socket.id} and userId: ${userId} connected`
    );

    // add user globally
    const { error, newUser } = await addUser({
      socketId: socket.id,
      userId: userId,
    });

    if (error) {
      logger.error("error adding user", error);
      socket.emit("errorOnWelcome", error);
    } else if (newUser) {
      // welcome new user - indicate that they are connected successfully
      socket.emit("welcome", newUser);

      // send information of all other logged in users to new user and all others online
      const allOnlineUsers: IOnlineUsers = await getOnlineUsers();
      socket.emit("getOnlineUsers", allOnlineUsers);
      socket.broadcast.emit("getOnlineUsers", allOnlineUsers);

      // create new or return active chat session, if more than two people online
      if (allOnlineUsers.length > 1) {
        const session: Nullable<IClientChatSession> =
          await getActiveChatSession();
        socket.emit("activeChatSession", session);
        socket.broadcast.emit("activeChatSession", session);

        // automatically send all users of this session
        const allChatSessionUsers: IOnlineUsers = await getChatSessionUsers(
          session.id
        );
        socket.emit("getAllChatSessionUsers", allChatSessionUsers);
        socket.broadcast.emit("getAllChatSessionUsers", allChatSessionUsers);

        // automatically send all chatmsgs of this session
        const allChatMsgs: IClientChatMessages = await getAllChatMsgs();
        socket.emit("getAllChatMsgs", allChatMsgs);
        socket.broadcast.emit("getAllChatMsgs", allChatMsgs);
      }
    } else {
      logger.error("couldn't find added user in db");
      socket.emit("errorOnWelcome", "this userId was not found in DB");
    }

    socket.on("disconnect", async () => {
      // remove user from online users array
      removeUser(socket.id);
      logger.info(
        `A user with socketId: ${socket.id} and userId: ${userId} disconnected`
      );

      // broadcast to all connected user that this user went offline
      const updatedOnlineUsers: IOnlineUsers = await getOnlineUsers();
      socket.broadcast.emit("getOnlineUsers", updatedOnlineUsers);

      // if this was the last user online or
      // if there is only one other user online but no chatmessages have been exchanged,
      // close active chat session if any
      const allChatMsgs: IClientChatMessages = await getAllChatMsgs();
      if (
        updatedOnlineUsers.length === 0 ||
        (updatedOnlineUsers.length == 1 && allChatMsgs.length === 0)
      ) {
        await closeChatSession();
        socket.broadcast.emit("closedChatSession");
      }
    });

    socket.on("getOnlineUsers", async () => {
      const allOnlineUsers: IOnlineUsers = await getOnlineUsers();
      socket.emit("getOnlineUsers", allOnlineUsers);
    });

    socket.on("getAllChatMsgs", async () => {
      console.log("getAllChatMsgs ");
      const allChatMsgs: IClientChatMessages = await getAllChatMsgs();
      socket.emit("getAllChatMsgs", allChatMsgs);
    });

    socket.on("createChatMessage", async (message: IClientChatMessage) => {
      const newMessage: Nullable<IClientChatMessage> = await createChatMsg(
        message
      );
      if (newMessage) {
        socket.emit("newChatMessage", newMessage);
        socket.broadcast.emit("newChatMessage", newMessage);
      }
    });

    socket.on("updatedOnlineUser", async () => {
      const session: Nullable<IClientChatSession> =
        await getActiveChatSession();
      const allChatSessionUsers: IOnlineUsers = await getChatSessionUsers(
        session.id
      );
      socket.emit("getAllChatSessionUsers", allChatSessionUsers);
      socket.broadcast.emit("getAllChatSessionUsers", allChatSessionUsers);

      const allOnlineUsers: IOnlineUsers = await getOnlineUsers();
      socket.emit("getOnlineUsers", allOnlineUsers);
      socket.broadcast.emit("getOnlineUsers", allOnlineUsers);
    });

    socket.on("typing", (userId: string) => {
      socket.broadcast.emit("typing", userId);
    });

    socket.on("stopTyping", (userId: string) => {
      socket.broadcast.emit("stopTyping", userId);
    });
  });
};

export default initializeSocketIO;
