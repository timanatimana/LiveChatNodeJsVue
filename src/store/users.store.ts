import usersService, { IUpdateUserData } from "@/services/users.service";
import { defineStore, storeToRefs } from "pinia";
import { AxiosError } from "axios";
import {
  IOnlineUser,
  IOnlineUsers,
  IUsers,
} from "@/interfaces/users.interfaces";
import { useAuthStore } from "@/store/auth.store";
import { useSocketIoStore } from "@/store/socketio.store";
import { CustomApiErrorResponse } from "@/interfaces/api.interfaces";
import { Nullable } from "@/types/common.types";

export interface UsersState {
  users: IUsers;
  onlineUsers: IOnlineUsers;
  chatSessionUsers: IOnlineUsers;
  loading: boolean;
  error: Nullable<string>;
}

export const useUsersStore = defineStore({
  id: "users",
  state: (): UsersState => ({
    users: [],
    onlineUsers: [],
    chatSessionUsers: [],
    loading: false,
    error: null,
  }),
  getters: {
    getOnlineUsers: (state) => state.onlineUsers,
    getChatSessionUsers: (state) => state.chatSessionUsers,
    getOnlineUserById: (state) => {
      return (userId: string) =>
        state.onlineUsers.find((u) => u.userId == userId);
    },
    getChatSessionUserById: (state) => {
      return (userId: string) =>
        state.chatSessionUsers.find((u) => u.userId == userId);
    },
    isUserOnlineById: (state) => {
      return (userId: string) =>
        state.onlineUsers.find((u) => u.userId == userId) !== undefined;
    },
    isLoading: (state) => state.loading,
    getUsers: (state) => state.users,
    getError: (state) => state.error,
  },
  actions: {
    async fetchUsers() {
      this.loading = true;
      this.clearErrorMessage();

      const authStore = useAuthStore();
      const { getUser: authUser } = storeToRefs(authStore);
      try {
        if (!authUser.value) {
          console.error(
            "user not authenticated, cannot send fetchUsers request"
          );
          return;
        }
        const response = await usersService.getAll(authUser.value?.id);

        if (response.status === 200) {
          this.users = response.data.users;
          this.users.forEach(
            (u) =>
              (u.online =
                this.onlineUsers.findIndex((ou) => ou.userId === u.id) !== -1)
          );
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
    //async getUserById(userId: string) {},
    async updateUserById(payload: IUpdateUserData) {
      this.loading = true;
      this.clearErrorMessage();

      const authStore = useAuthStore();
      const socketIoStore = useSocketIoStore();

      try {
        const response = await usersService.updateById(payload);

        if (response.status === 200) {
          authStore.$patch({
            user: response.data.user,
          });
          // inform all other online user of this update
          socketIoStore.sendUpdatedUser();
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
    async deleteUserById(userIdToDelete: string) {
      this.loading = true;
      this.clearErrorMessage();

      const authStore = useAuthStore();

      try {
        const response = await usersService.deleteById(userIdToDelete);

        if (response.status === 200) {
          authStore.logout();
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
    setOnlineUsers(onlineUsers: IOnlineUsers) {
      this.onlineUsers = onlineUsers;
      for (const user of this.users) {
        const userToChange = this.users.find((u) => u.id === user.id);
        if (userToChange) userToChange.online = true;
      }
    },
    setChatSessionUsers(chatSessionUsers: IOnlineUsers) {
      this.chatSessionUsers = chatSessionUsers;
    },
    addToOnlineUsers(userToAdd: IOnlineUser) {
      const index = this.onlineUsers.findIndex(
        (u) => u.socketId === userToAdd.socketId
      );
      if (index !== -1) {
        this.onlineUsers.push(userToAdd);
        const user = this.users.find((u) => u.id === userToAdd.userId);
        if (user) user.online = true;
      }
    },
    clearUserStore() {
      this.users = [];
      this.onlineUsers = [];
      this.chatSessionUsers = [];
    },
    clearErrorMessage() {
      this.error = null;
    },
  },
});
