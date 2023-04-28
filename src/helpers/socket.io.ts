import { io } from "socket.io-client";
import HttpService from "@/services/http-common.service";
import { useAuthStore } from "@/store";
import { storeToRefs } from "pinia";
import { CustomApiErrorResponse } from "@/interfaces/api.interfaces";
import { ErrorType } from "@/enums/errortype.enums";

const port = import.meta.env.SERVER_API_PORT || 3000;
const baseUrlServer =
  import.meta.env.BASE_URL_SERVER || "http://localhost:";

export const initSocketIo = (token: string, userid: string) => {
  const socket = io(`${baseUrlServer}${port}`, {
    auth: {
      token: token,
    },
    query: {
      userid: userid,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 3,
  });

  socket.on("connect_error", async (err) => {
    const error = err as unknown as CustomApiErrorResponse;

    if (error.type === ErrorType.SOCKETIO_TOKEN_EXPIRED) {
      const authStore = useAuthStore();
      const {
        getRefreshToken: refreshToken,
        getToken: token,
        getUser: authUser,
      } = storeToRefs(authStore);
      const res = await HttpService.getClient().post("/auth/refreshtoken", {
        refreshToken: refreshToken.value,
      });

      authStore.$patch({
        token: res.data.token,
        expiration: res.data.expiration,
      });

      if (authUser.value) initSocketIo(token.value, authUser.value.id);
      else console.error("Error refresh token socket io no authenticated user");
    }
    console.error(`socket.io server connect_error due to ${err.message}`);
  });

  socket.on("connect", function () {
    console.info("Connected to socket.io server");
  });

  socket.on("disconnect", function () {
    console.info("Disconnected from socket.io server");
  });

  return socket;
};
