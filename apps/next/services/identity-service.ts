import { AxiosInstance } from "axios";
import { BehaviorSubject } from "rxjs";
import { Problem } from "./types/problem";
import { parseProblem } from "./utils";

export type CreateAccountForm = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  validateOnly: boolean;
};

export type AccountModel = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  roles: string[];
};

export type AccountWithTokenModel = {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
} & AccountModel;

export class IdentityService {
  public currentAccountKey: string = "current-account";

  constructor(private readonly api: AxiosInstance) {}

  public async createAccount(
    data: CreateAccountForm,
  ): Promise<readonly [AccountWithTokenModel, Problem?]> {
    try {
      const response = await this.api.post("/account/create", data);
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }

  public async getCurrentAccount(): Promise<readonly [AccountModel, Problem?]> {
    try {
      const response = await this.api.get("/account/current");
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }
}
