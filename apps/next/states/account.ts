import { AccountWithTokenModel } from "@/services/identity-service";
import { useCookieState } from "@/hooks";

export const useAccountState = () =>
  useCookieState<AccountWithTokenModel | null>("current-account", null);
