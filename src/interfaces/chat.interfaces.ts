export interface IClientChatMessage {
    id: string;
    user: string;
    message: string;
    createdAt: string;
}

export type IChatMsgPayload = Omit<IClientChatMessage, "id" | "createdAt">;

export type IClientChatMessages = IClientChatMessage[];

export interface IClientChatSession {
    id: string;
    createdAt: string;
}
