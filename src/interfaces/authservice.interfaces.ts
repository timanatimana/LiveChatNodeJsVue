import { IUser } from "./users.interfaces";

export interface IUserLoginData {
    email: string;
    password: string;
}

export interface IUserRegisterData extends IUserLoginData {
    username: string;
}

export interface IUserAuthData {
    user: IUser;
    success: string;
    token: string;
    refreshToken: string;
    expiration: string;
}

export interface IActivateAccountData {
    userId: string;
    validateEmailToken: string;
}

export interface IResetPwData {
    password: string;
    resetToken: string;
}
