import { AccountWithToken } from "@/services/identity-service";
import { useCookieState } from "@/hooks";
import { BehaviorSubject } from "rxjs";
import { Category } from "@/services/category-service";

export const useAccountState = () =>
  useCookieState<AccountWithToken | null>("current-account", null);

export const useApplicationState = () =>
  useCookieState<{ theme: string; language: string }>("app-state", {
    theme: "light",
    language: "en"
  });