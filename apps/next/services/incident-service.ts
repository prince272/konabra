import { AxiosInstance } from "axios";
import { parseProblem, Problem } from ".";
import { Category } from "./category-service";
import { Account } from "./identity-service";

export const IncidentStatuses = [
  { value: "pending", label: "Pending" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "falseAlarm", label: "False Alarm" }
] as const;

export const IncidentSeverities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
] as const;

// Extract union types from the value fields
export type IncidentStatus = (typeof IncidentStatuses)[number]["value"];
export type IncidentSeverity = (typeof IncidentSeverities)[number]["value"];

export type CreateIncidentForm = {
  categoryId: string;
  summary: string;
  severity: IncidentSeverity;
  location?: string;
  longitude?: number;
  latitude?: number;
};

export type UpdateIncidentForm = Partial<CreateIncidentForm>;

export type Incident = {
  id: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedById: string;
  reportedAt: string;
  updatedAt: string;
  location: string;
  longitude: number;
  latitude: number;
  category: Category;
  reportedBy: Account;
};

export type IncidentSort = {
  sort?: string | null;
  order?: "asc" | "desc" | null;
};

export type IncidentFilter = {
  search?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  startDate?: string;
  endDate?: string;
};

export type IncidentPaginatedFilter = IncidentFilter &
  IncidentSort & {
    offset: number;
    limit: number;
  };

export type IncidentTrend = {
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

export type IncidentStatistics = {
  totalIncidents: IncidentTrend;
  resolvedIncidents: IncidentTrend;
  unresolvedIncidents: IncidentTrend;
};

export class IncidentService {
  constructor(private readonly api: AxiosInstance) {}

  public async createIncident(form: CreateIncidentForm): Promise<readonly [Incident, Problem?]> {
    try {
      const response = await this.api.post("/incidents", form);
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async updateIncident(
    id: string,
    form: UpdateIncidentForm
  ): Promise<readonly [Incident, Problem?]> {
    try {
      const response = await this.api.put(`/incidents/${id}`, form);
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async deleteIncident(id: string): Promise<Problem | undefined> {
    try {
      await this.api.delete(`/incidents/${id}`);
      return undefined;
    } catch (error) {
      return parseProblem(error);
    }
  }

  public async getIncidentById(id: string): Promise<readonly [Incident, Problem?]> {
    try {
      const response = await this.api.get(`/incidents/${id}`);
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async getPaginatedIncidents(
    filter?: IncidentPaginatedFilter
  ): Promise<readonly [{ items: Incident[]; count: number }, Problem?]> {
    try {
      const response = await this.api.get("/incidents", { params: filter });
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }

  public async getIncidentsStatistics(
    filter: IncidentFilter
  ): Promise<readonly [IncidentStatistics, Problem?]> {
    try {
      const response = await this.api.get("/incidents/statistics", { params: filter });
      return [response.data, undefined];
    } catch (error) {
      return [undefined!, parseProblem(error)];
    }
  }
}
