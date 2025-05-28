import { AccountWithTokenModel } from "@/services/identity-service";
import { useCookieState } from "@/hooks";

export const useAccountState = () =>
  useCookieState<AccountWithTokenModel | null>("current-account", null);

export const useAppState = () =>
  useCookieState<{ theme: string; language: string }>("app-state", {
    theme: "light",
    language: "en"
  });
