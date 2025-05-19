import axios, { AxiosResponse } from "axios";
import PQueue from "p-queue";
import Cookies from "universal-cookie";
import { AccountWithTokenModel, IdentityService } from "./identity-service";

const isDev = process.env.NODE_ENV === "development";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: !isDev
});

if (api.defaults.baseURL) {
  console.info(`Setting up API with server URL: ${api.defaults.baseURL}`);
} else {
  console.warn("No server URL found in environment variables");
}

const cookies = new Cookies();
const refreshQueue = new PQueue({ concurrency: 1 });

// Request interceptor
api.interceptors.request.use(
  (config) => {
    try {
      const currentAccount: AccountWithTokenModel | undefined = cookies.get("current-account");
      if (currentAccount?.accessToken) {
        config.headers.Authorization = `Bearer ${currentAccount.accessToken}`;
      }
    } catch (err) {
      console.warn("Failed to parse account cookie:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and avoid infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      const currentAccount: AccountWithTokenModel | undefined = cookies.get("current-account");

      if (!currentAccount?.refreshToken) {
        console.error("No refresh token available. Redirecting to sign-in.");

        // No refresh token available - clear and redirect
        cookies.remove("current-account", { path: "/" });

        if (typeof window !== "undefined") {
          window.location.href = "#signin";
        }

        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Execute refresh request in queue to prevent concurrent refreshes
        const response = (await refreshQueue.add(() =>
          axios.post<AccountWithTokenModel>(
            `/account/signin/refresh`,
            {
              refreshToken: currentAccount.refreshToken
            },
            {
              baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
              withCredentials: !isDev,
              headers: {
                "Content-Type": "application/json",
                ...(currentAccount.accessToken
                  ? { Authorization: `Bearer ${currentAccount.accessToken}` }
                  : {})
              }
            }
          )
        )) as AxiosResponse<AccountWithTokenModel, any>;

        const newAccount = response.data;

        // Update stored tokens
        cookies.set("current-account", newAccount, { path: "/" });

        // Update authorization headers
        api.defaults.headers.common.Authorization = `Bearer ${newAccount.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccount.accessToken}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.warn("Redirecting to sign-in due to refresh failure.", refreshError);

        // Refresh failed - clear tokens and redirect
        cookies.remove("current-account", { path: "/" });

        if (typeof window !== "undefined") {
          window.location.href = "#signin";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const identityService = new IdentityService(api);

export { api, identityService };
