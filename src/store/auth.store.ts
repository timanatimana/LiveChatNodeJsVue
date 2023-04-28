import { defineStore } from "pinia";
import router from "@/helpers/router";
import authenticationService from "@/services/authentication.service";
import { AxiosError } from "axios";
import { useMessageStore } from "@/store/message.store";
import dayjs from "dayjs";
import { Roles } from "@/enums/roles.enums";
import { useSocketIoStore } from "@/store/socketio.store";
import { ErrorType } from "@/enums/errortype.enums";
import { IUser } from "@/interfaces/users.interfaces";
import { useUsersStore } from "@/store/users.store";
import { delay } from "@/utils/promise.utils";
import {
  IUserLoginData,
  IUserRegisterData,
  IActivateAccountData,
  IResetPwData,
} from "@/interfaces/authservice.interfaces";
import { CustomApiErrorResponse } from "@/interfaces/api.interfaces";
import { Nullable } from "@/types/common.types";

export interface AuthenticationState {
  user: Nullable<IUser>;
  token: string;
  refreshToken: string;
  expiration: string;
  returnUrl: string;
  error: Nullable<string>;
  loading: boolean;
  showForcedLogout: boolean;
}

export const useAuthStore = defineStore({
  id: "auth",
  state: (): AuthenticationState => ({
    user: null,
    token: "",
    refreshToken: "",
    expiration: dayjs().format(),
    returnUrl: "",
    error: null,
    loading: false,
    showForcedLogout: false,
  }),
  getters: {
    getUser: (state) => state.user,
    isAdminUser: (state) =>
      state.user &&
      state.user.roles.map(({ name }) => name).includes(Roles.Admin),
    getToken: (state) => state.token,
    getRefreshToken: (state) => state.refreshToken,
    getError: (state) => state.error,
    isLoading: (state) => state.loading,
    isAuthenticated: (state) =>
      state.token.length > 0 &&
      state.expiration > dayjs().add(-5, "hour").format(),
    isShowForcedLogout: (state) => state.showForcedLogout,
  },
  actions: {
    async login(payload: IUserLoginData) {
      this.loading = true;
      this.clearErrorMessage();
      try {
        const res = await authenticationService.login(payload);

        if (res.status === 200) {
          this.$patch({
            user: res.data.user,
            token: res.data.token,
            expiration: res.data.expiration,
            refreshToken: res.data.refreshToken,
          });

          // TODO: replace with more secure solution (http-only cookie)
          localStorage.setItem("userId", res.data.user.id);

          // initiate socket io
          const socketIoStore = useSocketIoStore();
          socketIoStore.initiate(res.data.token, res.data.user.id);

          // redirect to previous url or default to home page
          router.push(this.returnUrl || "/home");
        }
      } catch (error) {
        const errData = (error as AxiosError).response?.data;
        if (errData) {
          const customErrData = errData as CustomApiErrorResponse;
          if (
            customErrData &&
            customErrData.type === ErrorType.LOGGED_IN_ON_OTHER_DEVICE
          ) {
            this.showForcedLogout = true;
          }
          this.error = customErrData.message;
        } else {
          this.error = `unkown error occured - ${JSON.stringify(error)}`;
          console.log(error);
        }
      } finally {
        this.loading = false;
      }
    },
    async logout(email?: string) {
      this.loading = true;
      this.clearErrorMessage();
      // TODO: this is very ugly, refactor!
      let userId = null;
      const itemLocalStorage = localStorage.getItem("userId");
      if (itemLocalStorage) userId = itemLocalStorage;
      if (!userId && this.user) userId = this.user.id;
      if (!userId && email) userId = email;
      if (!userId) {
        console.error("Could not logout user. No id!");
        return;
      }
      try {
        const res = await authenticationService.logout(userId);
        if (res.status === 200) {
          // clear everything related to the user
          localStorage.removeItem("userId");
          this.resetShowForcedLogout();
          const socketIoStore = useSocketIoStore();
          socketIoStore.disconnect();
          const userStore = useUsersStore();
          userStore.clearUserStore();
          this.user = null;
          this.clearToken();

          // set message for logout page
          const msgStore = useMessageStore();
          const logoutMsg = "You are logged out! - See you next time";
          msgStore.setMessage(logoutMsg);

          await delay(1000); // give it time to store in the DB (if tokens are deleted)
          router.push("/logout");
        } else {
          // should not happen
          const msgStore = useMessageStore();
          const message = "Could not logout user!?";
          msgStore.setMessage(message);

          router.push("/message");
        }
      } catch (error) {
        const errData = (error as AxiosError).response?.data;
        if (errData) {
          const customErrData = errData as CustomApiErrorResponse;
          this.error = customErrData.message;
        } else {
          this.error = `unkown error occured - ${JSON.stringify(error)}`;
          console.log(error);
        }
      } finally {
        this.loading = false;
      }
    },
    async register(payload: IUserRegisterData) {
      this.loading = true;
      this.clearErrorMessage();
      try {
        const response = await authenticationService.register(payload);
        if (response.status === 201) {
          const msgStore = useMessageStore();
          msgStore.setMessage(
            "Thank you for registering. Please check your email and activate your account!"
          );
          router.push("/postregister");
        } else {
          // should not happen
          const msgStore = useMessageStore();
          const message =
            "Unfortunately, something went wrong while trying to register your account.";
          msgStore.setMessage(message);

          router.push("/message");
        }
      } catch (error) {
        const errData = (error as AxiosError).response?.data;
        if (errData) {
          const customErrData = errData as CustomApiErrorResponse;
          this.error = customErrData.message;
        } else {
          this.error = `unkown error occured - ${JSON.stringify(error)}`;
          console.log(error);
        }
      } finally {
        this.loading = false;
      }
    },
    async verifyAccount(payload: IActivateAccountData) {
      this.loading = true;
      this.clearErrorMessage();
      try {
        const msgStore = useMessageStore();
        msgStore.setMessage("Your account could not be activated!");

        const response = await authenticationService.verifyAccount(payload);
        if (response.status === 201) {
          msgStore.setMessage(
            "You successfully activated your account and can proceed to login now!"
          );
          console.log("successfully activated account: ", response);
        }
      } catch (error) {
        const errData = (error as AxiosError).response?.data;
        if (errData) {
          const customErrData = errData as CustomApiErrorResponse;
          this.error = customErrData.message;
        } else {
          this.error = `unkown error occured - ${JSON.stringify(error)}`;
          console.log(error);
        }
      } finally {
        this.loading = false;
      }
    },
    async forgotPassword(payload: string) {
      this.loading = true;
      this.clearErrorMessage();
      try {
        const response = await authenticationService.forgotPassword(payload);
        if (response.status === 200) {
          const msgStore = useMessageStore();
          const logoutMsg =
            "Email to set a new password was successfully sent to you. Please check your inbox!";
          msgStore.setMessage(logoutMsg);

          router.push("/forgotpassword");
        } else {
          // should not happen
          const msgStore = useMessageStore();
          const message =
            "Unfortunately, something went wrong while trying to sent you an email with a link to reset your password.";
          msgStore.setMessage(message);

          router.push("/message");
        }
      } catch (error) {
        const errData = (error as AxiosError).response?.data;
        if (errData) {
          const customErrData = errData as CustomApiErrorResponse;
          this.error = customErrData.message;
        } else {
          this.error = `unkown error occured - ${JSON.stringify(error)}`;
          console.log(error);
        }
      } finally {
        this.loading = false;
      }
    },
    async resetPassword(payload: IResetPwData) {
      this.loading = true;
      this.clearErrorMessage();
      try {
        const response = await authenticationService.resetPassword(payload);
        if (response.status === 201) {
          const msgStore = useMessageStore();
          const logoutMsg = "You successfully changed your password!";
          msgStore.setMessage(logoutMsg);

          router.push("/resetpassword");
        } else {
          // should not happen
          const msgStore = useMessageStore();
          const message =
            "Unfortunately, something went wrong while trying to reset your password.";
          msgStore.setMessage(message);

          router.push("/message");
        }
      } catch (error) {
        const errData = (error as AxiosError).response?.data;
        if (errData) {
          const customErrData = errData as CustomApiErrorResponse;
          this.error = customErrData.message;
        } else {
          this.error = `unkown error occured - ${JSON.stringify(error)}`;
          console.log(error);
        }
      } finally {
        this.loading = false;
      }
    },
    clearToken() {
      this.token = "";
      this.expiration = dayjs().format();
      this.returnUrl = "";
    },
    clearErrorMessage() {
      this.error = null;
    },
    resetShowForcedLogout() {
      this.showForcedLogout = false;
    },
  },
});
