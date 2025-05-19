import { useCookieState } from "@/hooks";
import { AccountWithTokenModel } from "@/services/identity-service";

export const useAccountState = () => useCookieState<AccountWithTokenModel | null>("account", null);
