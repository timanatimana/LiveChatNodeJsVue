import { defineStore, storeToRefs } from "pinia";
import { Socket } from "socket.io-client";
import { initSocketIo } from "@/helpers/socket.io";
import dayjs from "dayjs";
import { useUsersStore } from "@/store/users.store";
import { useAuthStore } from "@/store/auth.store";
import { IOnlineUser, IOnlineUsers } from "@/interfaces/users.interfaces";
import {
    IChatMsgPayload,
    IClientChatMessage,
    IClientChatMessages,
    IClientChatSession,
} from "@/interfaces/chat.interfaces";
import { Nullable } from "@/types/common.types";

export interface SocketIoState {
    socket: Nullable<Socket>;
    chatmessages: IClientChatMessages;
    activeChatSession: Nullable<IClientChatSession>;
    typingUserIds: string[];
}

export const useSocketIoStore = defineStore({
    id: "socketio",
    state: (): SocketIoState => ({
        socket: null,
        chatmessages: [],
        typingUserIds: [],
        activeChatSession: null,
    }),
    getters: {
        getSocket: (state) => state.socket,
        getSortedChatMessages: (state) =>
            state.chatmessages.sort((m1, m2) => {
                if (dayjs(m1.createdAt).isBefore(dayjs(m2.createdAt))) return 1;
                else return -1;
            }),
        getTypingUserIds: (state) => state.typingUserIds,
        isTypingUser: (state) => {
            return (userId: string) => state.typingUserIds.findIndex((id) => id == userId) !== -1;
        },
    },
    actions: {
        initiate(token: string, userId: string) {
            if (!this.socket) this.socket = initSocketIo(token, userId);

            const userStore = useUsersStore();
            const authStore = useAuthStore();

            this.socket?.on("welcome", (data: IOnlineUser) => {
                userStore.addToOnlineUsers(data);
                this.getAllOnlineUsers();
            });

            this.socket?.on("errorOnWelcome", (error: string) => {
                console.error("errorOnWelcome: ", error);
                authStore.logout();
            });

            this.socket?.on("getOnlineUsers", (data: IOnlineUsers) => {
                userStore.setOnlineUsers(data);
            });

            this.socket?.on("activeChatSession", (data: IClientChatSession) => {
                this.activeChatSession = data;
            });

            this.socket?.on("getAllChatMsgs", (data: IClientChatMessages) => {
                this.chatmessages = data;
            });

            this.socket?.on("getAllChatSessionUsers", (data: IOnlineUsers) => {
                userStore.setChatSessionUsers(data);
            });

            this.socket?.on("newChatMessage", (data: IClientChatMessage) => {
                this.chatmessages.push(data);
            });

            this.socket?.on("closedChatSession", () => {
                this.clearSocketIoStore();
            });

            this.socket?.on("typing", (userId: string) => {
                const index = this.typingUserIds.findIndex((id) => id === userId);
                if (index === -1) {
                    this.typingUserIds.push(userId);
                }
            });

            this.socket?.on("stopTyping", (userId: string) => {
                const index = this.typingUserIds.findIndex((id) => id === userId);
                if (index !== -1) {
                    this.typingUserIds.splice(index, 1)[0];
                }
            });
        },
        sendChatMessage(text: string) {
            if (!this.socket) console.error("sendChatMessage - error no socket");

            const authStore = useAuthStore();
            const userStore = useUsersStore();
            const { getUser: authUser } = storeToRefs(authStore);
            const { getChatSessionUserById, getOnlineUserById, getChatSessionUsers } = storeToRefs(userStore);

            if (authUser.value) {
                const chatMessage: IChatMsgPayload = {
                    message: text,
                    user: authUser.value?.id,
                };

                this.socket?.emit("createChatMessage", chatMessage);

                if (getChatSessionUserById.value(authUser.value.id) === undefined) {
                    const users = getChatSessionUsers.value;
                    const thisUser = getOnlineUserById.value(authUser.value.id);
                    if (thisUser) users.push(thisUser);
                    userStore.setChatSessionUsers(users);
                }
            }
        },
        sendUpdatedUser() {
            this.socket?.emit("updatedOnlineUser");
        },
        startTyping() {
            if (!this.socket) console.error("startTyping - error no socket");
            const authStore = useAuthStore();
            const { getUser: authUser } = storeToRefs(authStore);

            if (authUser.value) {
                const index = this.typingUserIds.findIndex((id) => id === authUser.value!.id);
                if (index === -1) {
                    this.typingUserIds.push(authUser.value.id);
                }
                this.socket?.emit("typing", authUser.value.id);
            }
        },
        stopTyping() {
            if (!this.socket) console.error("stopTyping - error no socket");
            const authStore = useAuthStore();
            const { getUser: authUser } = storeToRefs(authStore);

            if (authUser.value) {
                const index = this.typingUserIds.findIndex((id) => id === authUser.value!.id);
                if (index !== -1) {
                    this.typingUserIds.splice(index, 1)[0];
                }
                this.socket?.emit("stopTyping", authUser.value.id);
            }
        },
        disconnect() {
            if (!this.socket) console.error("disconnet - error no socket");
            this.socket?.disconnect();
            this.socket = null;
            this.clearSocketIoStore();
        },
        clearSocketIoStore() {
            this.activeChatSession = null;
            this.chatmessages = [];
            this.typingUserIds = [];
            this.activeChatSession = null;
        },
        getAllOnlineUsers() {
            if (!this.socket) console.error("getAllOnlineUsers - error no socket");
            this.socket?.emit("getOnlineUsers");
        },
    },
});
