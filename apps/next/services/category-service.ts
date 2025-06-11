import { AxiosInstance } from "axios";
import { parseProblem, Problem } from ".";

export type CreateCategoryForm = {
  name: string;
  description: string;
};

export type UpdateCategoryForm = CreateCategoryForm & {};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryFilter = {
  sort?: string | null;
  order?: "asc" | "desc" | null;
  search?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type CategoryPaginatedFilter = CategoryFilter & {
  offset: number;
  limit: number;
};

export type CategoryTrend = {
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

export type CategoryStatistics = {
  totalCategories: CategoryTrend;
};

export class CategoryService {
  constructor(private readonly api: AxiosInstance) {}

  public async createCategory(form: CreateCategoryForm): Promise<readonly [Category, Problem?]> {
    try {
      const response = await this.api.post("/categories", form);
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async updateCategory(
    id: string,
    form: UpdateCategoryForm
  ): Promise<readonly [Category, Problem?]> {
    try {
      const response = await this.api.put(`/categories/${id}`, form);
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async deleteCategory(id: string): Promise<Problem | undefined> {
    try {
      await this.api.delete(`/categories/${id}`);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async getCategoryById(id: string): Promise<readonly [Category, Problem?]> {
    try {
      const response = await this.api.get(`/categories/${id}`);
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async getPaginatedCategories(
    filter?: Partial<CategoryPaginatedFilter>
  ): Promise<readonly [{ items: Category[]; count: number }, Problem?]> {
    try {
      const response = await this.api.get("/categories", { params: filter });
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async getCategoriesStatistics(
    filter: CategoryFilter
  ): Promise<readonly [CategoryStatistics, Problem?]> {
    try {
      const response = await this.api.get("/categories/statistics", { params: filter });
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }
}
