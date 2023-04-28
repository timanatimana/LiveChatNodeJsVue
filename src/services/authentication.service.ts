import {
    IUserLoginData,
    IUserAuthData,
    IUserRegisterData,
    IActivateAccountData,
    IResetPwData,
} from "@/interfaces/authservice.interfaces";
import HttpService from "@/services/http-common.service";
import { AxiosResponse } from "axios";

class AuthenticationService {
    login(data: IUserLoginData): Promise<AxiosResponse<IUserAuthData>> {
        return HttpService.getClient().post<IUserAuthData>("/auth/login", data);
    }

    logout(userId: string): Promise<AxiosResponse<IUserAuthData>> {
        return HttpService.getClient().post<IUserAuthData>(`/auth/logout/${userId}`);
    }

    register(data: IUserRegisterData): Promise<AxiosResponse<IUserAuthData>> {
        return HttpService.getClient().post<IUserAuthData>("/auth/register", data);
    }

    verifyAccount(data: IActivateAccountData): Promise<AxiosResponse> {
        return HttpService.getClient().post<IActivateAccountData>(
            `/auth/activateaccount/${data.userId}/${data.validateEmailToken}`
        );
    }

    resetPassword(data: IResetPwData): Promise<AxiosResponse> {
        return HttpService.getClient().post<IResetPwData>(`/auth/resetpassword/${data.resetToken}`, data);
    }

    forgotPassword(email: string): Promise<AxiosResponse> {
        return HttpService.getClient().post<string>("/auth/forgotpassword", { email: email });
    }
}

export default new AuthenticationService();
