import { AxiosInstance } from "axios";
import { parseProblem, Problem } from ".";

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
  title: string;
  description: string;
  severity: IncidentSeverity;
};

export type UpdateIncidentForm = Partial<CreateIncidentForm>;

export type Incident = {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedById: string;
  createdAt: string;
  updatedAt: string;
};

export type IncidentFilter = {
  sort?: string | null;
  order?: "asc" | "desc" | null;
  search?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
};

export type IncidentPaginatedFilter = IncidentFilter & {
  offset: number;
  limit: number;
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
}
