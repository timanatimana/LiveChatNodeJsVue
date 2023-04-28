import { IUser, IUsers } from "@/interfaces/users.interfaces";
import HttpService from "@/services/http-common.service";
import { AxiosResponse } from "axios";

export interface IUpdateUserData {
    userId: string;
    username: string;
    avatarseed: number;
    avatarstyle: string;
}

export interface IUpdateUserRes {
    success: boolean;
    user: IUser;
}

export interface IGetAllUserRes {
    success: boolean;
    users: IUsers;
}

class UsersService {
    getAll(userId: string): Promise<AxiosResponse<IGetAllUserRes>> {
        return HttpService.getClient().get<IGetAllUserRes>(`/users/getall/${userId}`);
    }
    updateById(data: IUpdateUserData): Promise<AxiosResponse<IUpdateUserRes>> {
        return HttpService.getClient().post<IUpdateUserRes>(`/users/update/${data.userId}`, data);
    }
    deleteById(userId: string): Promise<AxiosResponse<IUpdateUserRes>> {
        return HttpService.getClient().post<IUpdateUserRes>(`/users/delete/${userId}`);
    }
}

export default new UsersService();
