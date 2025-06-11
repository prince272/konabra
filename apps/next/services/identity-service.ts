import { AxiosInstance } from "axios";
import { parseProblem, Problem } from ".";

export type CreateAccountForm = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  validateOnly: boolean;
};

export type Account = {
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
  primaryRole: string;
  settings: {
    [key: string]: any;
  };
};

export type AccountWithToken = {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
} & Account;

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

export type CreateRoleForm = {
  name: string;
  description: string;
};

export type UpdateRoleForm = CreateRoleForm;

export type Role = {
  id: string;
  name: string;
  description: string;
};

export type RoleSort = {
  sort?: string | null;
  order?: "asc" | "desc" | null;
};

export type RoleFilter = {
  search?: string;
};

export type RolePaginatedFilter = RoleFilter &
  RoleSort & {
    offset: number;
    limit: number;
  };

export type UserFilter = {
  sort?: string | null;
  order?: "asc" | "desc" | null;
  search?: string;
  startDate?: string | null; // ISO date string
  endDate?: string | null; // ISO date string
};

export type UserPaginatedFilter = UserFilter & {
  offset: number;
  limit: number;
};

export type UserTrend = {
  oldStartDate: string;
  oldEndDate: string;
  newStartDate: string;
  newEndDate: string;
  oldCount: number;
  newCount: number;
  percentChange: number; // Percentage change from old to new count
  isIncrease: boolean; // True if new count is greater than old count
  isDecrease: boolean; // True if new count is less than old count
};

export type UserStatistics = {
  totalUsers: UserTrend;
};

export class IdentityService {
  constructor(private readonly api: AxiosInstance) {}

  public async createAccount(
    data: CreateAccountForm
  ): Promise<readonly [AccountWithToken, Problem?]> {
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

  public async signIn(data: SignInForm): Promise<readonly [AccountWithToken, Problem?]> {
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

  public async getCurrentAccount(): Promise<readonly [Account, Problem?]> {
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

  public async createRole(form: CreateRoleForm): Promise<readonly [Role, Problem?]> {
    try {
      const response = await this.api.post("/roles", form);
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }

  public async updateRole(id: string, form: UpdateRoleForm): Promise<readonly [Role, Problem?]> {
    try {
      const response = await this.api.put(`/roles/${id}`, form);
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }

  public async deleteRole(id: string): Promise<Problem | undefined> {
    try {
      await this.api.delete(`/roles/${id}`);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async getPaginatedRoles(
    filter?: RolePaginatedFilter
  ): Promise<readonly [{ items: Role[]; count: number }, Problem?]> {
    try {
      const response = await this.api.get("/roles", {
        params: filter
      });
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }

  public async getRoleById(id: string): Promise<readonly [Role, Problem?]> {
    try {
      const response = await this.api.get(`/roles/${id}`);
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }

  public async getPaginatedUsers(
    filter?: UserPaginatedFilter
  ): Promise<readonly [{ items: Account[]; count: number }, Problem?]> {
    try {
      const response = await this.api.get("/users", {
        params: filter
      });
      return [response.data, undefined] as const;
    } catch (error) {
      return [undefined!, parseProblem(error)] as const;
    }
  }

  public async getUsersStatistics(
    filter: UserFilter
  ): Promise<readonly [UserStatistics, Problem?]> {
    try {
      const response = await this.api.get("/users/statistics", { params: filter });
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }
}
