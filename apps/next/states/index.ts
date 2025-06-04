import { AccountWithToken } from "@/services/identity-service";
import { useCookieState } from "@/hooks";

export const useAccountState = () =>
  useCookieState<AccountWithToken | null>("current-account", null);

export const useApplicationState = () =>
  useCookieState<{ theme: string; language: string }>("app-state", {
    theme: "light",
    language: "en"
  });