import { ErrorType } from "@/enums/errortype.enums";
import { useAuthStore, useMessageStore } from "@/store";
import axios, { AxiosInstance } from "axios";
import { storeToRefs } from "pinia";

class HttpService {
  private port = import.meta.env.SERVER_API_PORT || 3000;
  private baseUrlServer =
    import.meta.env.BASE_URL_SERVER || "http://localhost:";

  getBaseUrl = () => {
    return `${this.baseUrlServer}${this.port}/api`;
  };

  getClient = () => {
    const authStore = useAuthStore();
    const { getToken: token, getRefreshToken: refreshToken } =
      storeToRefs(authStore);

    const apiClient: AxiosInstance = axios.create({
      baseURL: this.getBaseUrl(),
      headers: {
        "Content-type": "application/json",
      },
    });

    // always send token in every request to backend
    apiClient.interceptors.request.use(
      (config) => {
        if (config.headers && token.value) {
          config.headers["Authorization"] = `Bearer ${token.value}`;
          return config;
        }
        return config;
      },
      (error) => {
        Promise.reject(error);
      }
    );

    // if token expired, try get a new one with refreshtoken
    apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const prevRequest = error?.config;
        if (
          error?.response?.type === ErrorType.TOKEN_EXPIRED &&
          !prevRequest?.sent
        ) {
          prevRequest.sent = true;
          try {
            const res = await apiClient.post("/auth/refreshtoken", {
              refreshToken: refreshToken.value,
            });

            if (res.status === 201) {
              authStore.$patch({
                token: res.data.token,
                expiration: res.data.expiration,
              });
            } else {
              const msgStore = useMessageStore();
              const message =
                "Unfortunately, something went wrong while trying to refresh your expired token.";
              msgStore.setMessage(message);
              authStore.logout();
            }
          } catch (error) {
            console.error(
              "error happened when trying to get refresh token: ",
              error
            );
            authStore.logout();
          }

          return apiClient(prevRequest);
        } else {
          return Promise.reject(error);
        }
      }
    );

    return apiClient;
  };
}

export default new HttpService();
