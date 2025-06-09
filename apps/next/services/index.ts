import axios, { AxiosError, AxiosResponse, HttpStatusCode, isAxiosError } from "axios";
import PQueue from "p-queue";
import queryString from "query-string";
import Cookies from "universal-cookie";
import { stringifyPath, toRelativeUrl } from "@/utils";
import { CategoryService } from "./category-service";
import { AccountWithToken, IdentityService } from "./identity-service";
import { IncidentService } from "./incident-service";

const isDev = process.env.NODE_ENV === "development";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: !isDev,
  paramsSerializer: {
    serialize: (params) => queryString.stringify(params, { arrayFormat: "bracket" })
  }
});

if (api.defaults.baseURL) {
  console.info(`Setting up API with server URL: ${api.defaults.baseURL}`);
} else {
  console.warn("No server URL found in environment variables");
}

const cookies = new Cookies();
const refreshQueue = new PQueue({ concurrency: 1 });

let isRefreshing = false;
let requestQueue: ((token: string) => void)[] = [];

// Request interceptor
api.interceptors.request.use(
  (config) => {
    try {
      const currentAccount: AccountWithToken | undefined = cookies.get("current-account");
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

    if (error.response?.status === HttpStatusCode.Unauthorized && !originalRequest._retry) {
      const currentAccount: AccountWithToken | undefined = cookies.get("current-account");

      if (!currentAccount?.refreshToken) {
        console.error("No refresh token available. Redirecting to sign-in.");
        cookies.remove("current-account", { path: "/" });

        if (typeof window !== "undefined") {
          window.location.href = "#signin";
        }

        return Promise.reject(error);
      }

      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        requestQueue.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });

        if (!isRefreshing) {
          isRefreshing = true;

          refreshQueue.add(async () => {
            try {
              const response = await axios.post<AccountWithToken>(
                `/account/signin/refresh`,
                { refreshToken: currentAccount.refreshToken },
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
              );

              const newAccount = response.data;

              cookies.set("current-account", newAccount, { path: "/" });
              api.defaults.headers.common.Authorization = `Bearer ${newAccount.accessToken}`;

              // Retry all queued requests
              requestQueue.forEach((cb) => cb(newAccount.accessToken));
              requestQueue = [];
            } catch (refreshError) {
              requestQueue = [];
              //cookies.remove("current-account", { path: "/" });

              const status = (refreshError as AxiosError)?.response?.status;

              if ((status === HttpStatusCode.BadRequest || status === HttpStatusCode.Unauthorized) && typeof window !== "undefined") {
                const returnUrl = toRelativeUrl(window.location.href || "/");
                window.location.href = stringifyPath(
                  {
                    url: "/",
                    query: { returnUrl },
                    fragmentIdentifier: "signin"
                  },
                  { skipNull: true }
                );
              }

              reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          });
        }
      });
    }

    return Promise.reject(error);
  }
);

export const identityService = new IdentityService(api);
export const categoryService = new CategoryService(api);
export const incidentService = new IncidentService(api);

export type Problem = {
  type: string;
  message: string;
  status: number;
  errors: Record<string, string>;
  reason: string;
};

const DEFAULT_PROBLEM: Problem = {
  type: "https://httpstatuses.com",
  message: "An unknown error occurred.",
  status: -999,
  errors: {},
  reason: "Unknown error"
};

const NETWORK_ERROR: Problem = {
  ...DEFAULT_PROBLEM,
  message: "A network error occurred.",
  status: -1,
  reason: "Network error"
};

export function parseProblem(error: unknown): Problem {
  if (!isAxiosError(error)) {
    return DEFAULT_PROBLEM;
  }

  const axiosError = error as AxiosError<any>;
  const { response } = axiosError;

  if (!response) {
    return NETWORK_ERROR;
  }

  const { data } = response;

  if (data && typeof data === "object") {
    return {
      type: (data.type as string) ?? DEFAULT_PROBLEM.type,
      message: (data.message as string) ?? DEFAULT_PROBLEM.message,
      status: (data.status as number) ?? DEFAULT_PROBLEM.status,
      errors: (data.errors as Record<string, any>) ?? DEFAULT_PROBLEM.errors,
      reason: (data.reason as string) ?? DEFAULT_PROBLEM.reason
    };
  }

  return DEFAULT_PROBLEM;
}
