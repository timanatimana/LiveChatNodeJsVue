export interface IUser {
    id: string;
    username: string;
    avatarseed: number;
    avatarstyle: string;
    email: string;
    roles: IRoles;
    createdAt: string;
    updatedAt: string;
    active: boolean;
    online: boolean;
}

export type IUsers = IUser[];

export interface IRole {
    name: string;
    description: string;
}
export type IRoles = IRole[];

export interface IOnlineUser {
    userId: string;
    socketId: string;
    username: string;
    avatarseed: number;
    avatarstyle: string;
}

export type IOnlineUsers = IOnlineUser[];
