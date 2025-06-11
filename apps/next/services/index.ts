import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, HttpStatusCode, isAxiosError } from "axios";
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

// Helper to get current account from cookie
function getCurrentAccount(): AccountWithToken | undefined {
  try {
    return cookies.get("current-account") as AccountWithToken | undefined;
  } catch (err) {
    console.warn("Failed to parse account cookie:", err);
    return undefined;
  }
}

// Helper to save updated account
function setCurrentAccount(account: AccountWithToken) {
  cookies.set("current-account", account, { path: "/" });
  // Update default header for future requests
  api.defaults.headers.common.Authorization = `Bearer ${account.accessToken}`;
}

// Extend AxiosRequestConfig to include our retry flag
interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Queue for holding pending requests while refreshing
type PendingRequest = {
  resolve: (value: AxiosResponse<any>) => void;
  reject: (error: any) => void;
  config: RetryAxiosRequestConfig;
};
let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

// Process the queue: either retry with new token or reject all
function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      // Clone the config to avoid mutation
      prom.config.headers = prom.config.headers || {};
      prom.config.headers.Authorization = `Bearer ${token}`;
      // Retry request
      api.request(prom.config).then(prom.resolve).catch(prom.reject);
    } else {
      // No token and no error: reject generically
      prom.reject(new Error("Could not refresh token"));
    }
  });
  failedQueue = [];
}

// Request interceptor: attach access token if present
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

// Response interceptor: handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    // If no response or not a 401, pass through
    if (!error.response || error.response.status !== HttpStatusCode.Unauthorized) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest._retry) {
      // Already retried once; reject
      return Promise.reject(error);
    }

    // Mark this request as having been retried
    originalRequest._retry = true;

    const currentAccount = getCurrentAccount();
    if (!currentAccount?.refreshToken) {
      // No refresh token: clear and redirect
      console.error("No refresh token available. Redirecting to sign-in.");
      cookies.remove("current-account", { path: "/" });
      if (typeof window !== "undefined") {
        window.location.href = "#signin";
      }
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<AxiosResponse<any>>((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    // Start refresh flow
    isRefreshing = true;

    return new Promise<AxiosResponse<any>>(async (resolve, reject) => {
      try {
        // Perform refresh with raw axios to avoid interceptors
        const refreshResponse = await axios.post<AccountWithToken>(
          `/account/signin/refresh`,
          { refreshToken: currentAccount.refreshToken },
          {
            baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
            withCredentials: !isDev,
            headers: {
              "Content-Type": "application/json"
              // Optionally include old access token if backend expects it
              // ...(currentAccount.accessToken ? { Authorization: `Bearer ${currentAccount.accessToken}` } : {})
            }
          }
        );

        const newAccount = refreshResponse.data;
        // Persist new tokens
        setCurrentAccount(newAccount);

        // Process queued requests
        processQueue(null, newAccount.accessToken);

        // Retry the original request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccount.accessToken}`;
        const retryResponse = await api.request(originalRequest);
        resolve(retryResponse);
      } catch (refreshError) {
        // On refresh failure: reject queued requests, clear storage, redirect
        processQueue(refreshError, null);

        cookies.remove("current-account", { path: "/" });
        const status = (refreshError as AxiosError)?.response?.status;
        if (
          (status === HttpStatusCode.BadRequest || status === HttpStatusCode.Unauthorized) &&
          typeof window !== "undefined"
        ) {
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
);

// Export services
export const identityService = new IdentityService(api);
export const categoryService = new CategoryService(api);
export const incidentService = new IncidentService(api);

// Problem parsing logic unchanged
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
