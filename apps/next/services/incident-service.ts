import { AxiosInstance } from "axios";
import { parseProblem, Problem } from ".";

export const IncidentStatus = {
  Pending: "pending",
  Investigating: "investigating",
  Resolved: "resolved",
  FalseAlarm: "falseAlarm"
} as const;

export const IncidentSeverity = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
  Critical: "Critical"
} as const;

export type Status = (typeof IncidentStatus)[keyof typeof IncidentStatus];
export type Severity = (typeof IncidentSeverity)[keyof typeof IncidentSeverity];

export type CreateIncidentForm = {
  categoryId: string;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  reportedById: string;
};

export type UpdateIncidentForm = Partial<CreateIncidentForm>;

export type Incident = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  reportedById: string;
  createdAt: string;
  updatedAt: string;
};

export type IncidentFilter = {
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  status?: Status;
  severity?: Severity;
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
