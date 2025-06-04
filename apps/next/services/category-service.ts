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
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryFilter = {
  sort?: string;
  order?: string;
  search?: string;
};

export type CategoryPaginatedFilter = CategoryFilter & {
  offset: number;
  limit: number;
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

  public async getCategories(filter?: CategoryFilter): Promise<readonly [Category[], Problem?]> {
    try {
      const response = await this.api.get("/categories/all", { params: filter });
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async getPaginatedCategories(
    filter?: CategoryPaginatedFilter
  ): Promise<readonly [{ items: Category[]; count: number }, Problem?]> {
    try {
      const response = await this.api.get("/categories", { params: filter });
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }
}
