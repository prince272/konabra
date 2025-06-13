import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
  isAxiosError
} from "axios";
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

function getCurrentAccount(): AccountWithToken | undefined {
  try {
    return cookies.get("current-account") as AccountWithToken | undefined;
  } catch (err) {
    console.warn("Failed to parse account cookie:", err);
    return undefined;
  }
}

function setCurrentAccount(account: AccountWithToken) {
  cookies.set("current-account", account, { path: "/" });
  api.defaults.headers.common.Authorization = `Bearer ${account.accessToken}`;
}

interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

type PendingRequest = {
  resolve: (value: AxiosResponse<any>) => void;
  reject: (error: any) => void;
  config: RetryAxiosRequestConfig;
};

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.config.headers = prom.config.headers || {};
      prom.config.headers.Authorization = `Bearer ${token}`;
      api.request(prom.config).then(prom.resolve).catch(prom.reject);
    } else {
      prom.reject(new Error("Could not refresh token"));
    }
  });
  failedQueue = [];
}

api.interceptors.request.use(
  (config) => {
    const currentAccount = getCurrentAccount();
    if (currentAccount?.accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${currentAccount.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    if (!error.response || error.response.status !== HttpStatusCode.Unauthorized) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const currentAccount = getCurrentAccount();
    if (!currentAccount?.refreshToken) {
      console.error("No refresh token available. Redirecting to sign-in.");
      cookies.remove("current-account", { path: "/" });
      if (typeof window !== "undefined") {
        window.location.href = "#signin";
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<AxiosResponse<any>>((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;

    return new Promise<AxiosResponse<any>>(async (resolve, reject) => {
      let newAccount: AccountWithToken;

      // STEP 1: Try refreshing token
      try {
        const refreshResponse = await axios.post<AccountWithToken>(
          `/account/signin/refresh`,
          { refreshToken: currentAccount.refreshToken },
          {
            baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
            withCredentials: !isDev,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        newAccount = refreshResponse.data;
        setCurrentAccount(newAccount);
        processQueue(null, newAccount.accessToken);
      } catch (refreshError) {
        processQueue(refreshError, null);

        const status = (refreshError as AxiosError)?.response?.status;
        if (
          (status === HttpStatusCode.BadRequest || status === HttpStatusCode.Unauthorized) &&
          typeof window !== "undefined"
        ) {
          cookies.remove("current-account", { path: "/" });
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

        isRefreshing = false;
        return reject(refreshError);
      }

      // STEP 2: Retry the original request
      try {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccount.accessToken}`;
        const retryResponse = await api.request(originalRequest);
        resolve(retryResponse);
      } catch (retryError) {
        reject(retryError); // Don't confuse with refreshError
      } finally {
        isRefreshing = false;
      }
    });
  }
);

// Services
export const identityService = new IdentityService(api);
export const categoryService = new CategoryService(api);
export const incidentService = new IncidentService(api);

// Error parsing
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
