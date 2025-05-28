import { AxiosInstance } from "axios";
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
  fullName: string;
  userName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  lastPasswordChangedAt: string;
  roles: string[];
  settings: {
    [key: string]: any;
  };
};

export type AccountWithTokenModel = {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
} & AccountModel;

export type SignInForm = {
  username: string;
  password: string;
};

export type SignOutForm = {
  refreshToken: string;
  global: boolean;
};

export type ResetPasswordForm = {
  username: string;
};

export type CompleteResetPasswordForm = {
  username: string;
  newPassword: string;
  confirmPassword: string;
  code: string;
  validateOnly: boolean;
};

export type VerifyAccountForm = {
  username: string;
};

export type CompleteVerifyAccountForm = {
  username: string;
  code: string;
};

export type ChangeAccountForm = {
  newUsername: string;
};

export type CompleteChangeAccountForm = {
  newUsername: string;
  code: string;
};

export class IdentityService {
  constructor(private readonly api: AxiosInstance) {}

  public async createAccount(
    data: CreateAccountForm
  ): Promise<readonly [AccountWithTokenModel, Problem?]> {
    try {
      const response = await this.api.post("/account/create", data);
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }

  public async verifyAccount(data: VerifyAccountForm): Promise<Problem | undefined> {
    try {
      const response = await this.api.post("/account/verify", data);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async completeVerifyAccount(
    form: CompleteVerifyAccountForm
  ): Promise<Problem | undefined> {
    try {
      const _ = await this.api.post("/account/verify/complete", form);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async changeAccount(data: ChangeAccountForm): Promise<Problem | undefined> {
    try {
      const response = await this.api.post("/account/change", data);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async completeChangeAccount(
    form: CompleteChangeAccountForm
  ): Promise<Problem | undefined> {
    try {
      const _ = await this.api.post("/account/change/complete", form);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async signIn(data: SignInForm): Promise<readonly [AccountWithTokenModel, Problem?]> {
    try {
      const response = await this.api.post("/account/signin", data);
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }

  public async signOut(form: SignOutForm): Promise<Problem | undefined> {
    try {
      const _ = await this.api.post("/account/signout", form);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async resetPassword(form: ResetPasswordForm): Promise<Problem | undefined> {
    try {
      const _ = await this.api.post("/account/password/reset", form);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async completeResetPassword(
    form: CompleteResetPasswordForm
  ): Promise<Problem | undefined> {
    try {
      const _ = await this.api.post("/account/password/reset/complete", form);
      return undefined;
    } catch (error) {
      return parseProblem(error);
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

  public async deleteCurrentAccount(): Promise<Problem | undefined> {
    try {
      const _ = await this.api.delete("/account/current");
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }
}
