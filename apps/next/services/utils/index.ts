import { AxiosError, isAxiosError } from "axios";
import { Problem } from "../types/problem";

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
    // Use nullish coalescing to default missing fields
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
