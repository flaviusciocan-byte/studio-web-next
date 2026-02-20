import type { ExportFormat, SpineMetrics, TemplateSpec } from "@zaria/shared";

export interface Session {
  token: string;
  tenantId: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  inputType: "RAW" | "STRUCTURED" | "IMPORTED" | "COPYWRITER";
  rawText: string;
  templateId: string;
  spineAd: number;
  spinePm: number;
  spineEsi: number;
  metadata: unknown;
  chapters: unknown;
  toc: unknown;
  layout: unknown;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExportArtifactRecord {
  id: string;
  format: "PDF" | "EPUB" | "DOCX" | "BUNDLE";
  status: "PENDING" | "SUCCESS" | "FAILED";
  filename: string | null;
  mimeType: string | null;
  bytes: number | null;
  createdAt: string;
  updatedAt: string;
  error: string | null;
}

export interface TenantProfile {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  featureFlags: Array<{
    module: string;
    enabled: boolean;
    updatedAt: string;
  }>;
  _count: {
    users: number;
    documents: number;
    exports: number;
    webhooks: number;
  };
}

export interface MemorySearchResult {
  id: string;
  title: string;
  snippet: string;
  processed: boolean;
  updatedAt: string;
}

interface ApiErrorBody {
  error?: {
    message?: string;
  };
}

const defaultApiBase = "http://localhost:8080";

export class ApiClient {
  private token: string | null = null;
  private tenantId: string | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultApiBase) {
    this.baseUrl = baseUrl;
  }

  setSession(session: Session): void {
    this.token = session.token;
    this.tenantId = session.tenantId;
  }

  clearSession(): void {
    this.token = null;
    this.tenantId = null;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers ?? {});

    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    if (this.token) {
      headers.set("authorization", `Bearer ${this.token}`);
    }

    if (this.tenantId) {
      headers.set("x-tenant-id", this.tenantId);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const body = (await response.json()) as ApiErrorBody;
        message = body.error?.message ?? message;
      } catch {
        message = response.statusText || message;
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async register(payload: {
    tenantName: string;
    tenantSlug: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<Session> {
    const response = await this.request<{ token: string; tenantId: string }>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return { token: response.token, tenantId: response.tenantId };
  }

  async login(payload: {
    tenantSlug: string;
    email: string;
    password: string;
  }): Promise<Session> {
    const response = await this.request<{ token: string; tenantId: string }>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return { token: response.token, tenantId: response.tenantId };
  }

  async getTemplates(): Promise<TemplateSpec[]> {
    const response = await this.request<{ items: TemplateSpec[] }>("/v1/templates");
    return response.items;
  }

  async createDocument(payload: {
    inputType: "raw" | "structured" | "imported" | "copywriter";
    title: string;
    rawText: string;
    sourceReference?: string;
    templateId: string;
    spine: SpineMetrics;
    metadata?: {
      subtitle?: string;
      author?: string;
      language?: string;
      keywords?: string[];
    };
  }): Promise<DocumentRecord> {
    const response = await this.request<{ item: DocumentRecord }>("/v1/documents", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return response.item;
  }

  async processDocument(documentId: string, force = false): Promise<DocumentRecord> {
    const response = await this.request<{ item: DocumentRecord }>(
      `/v1/documents/${documentId}/process`,
      {
        method: "POST",
        body: JSON.stringify({ force })
      }
    );
    return response.item;
  }

  async exportDocument(payload: {
    documentId: string;
    format: ExportFormat;
    includeFormats?: Array<"pdf" | "epub" | "docx">;
    spine?: SpineMetrics;
  }): Promise<ExportArtifactRecord> {
    const response = await this.request<{ item: ExportArtifactRecord }>(
      `/v1/exports/${payload.documentId}`,
      {
        method: "POST",
        body: JSON.stringify({
          format: payload.format,
          includeFormats: payload.includeFormats,
          spine: payload.spine
        })
      }
    );

    return response.item;
  }

  async downloadExport(exportId: string): Promise<{ filename: string; blob: Blob }> {
    const headers = new Headers();

    if (this.token) {
      headers.set("authorization", `Bearer ${this.token}`);
    }

    if (this.tenantId) {
      headers.set("x-tenant-id", this.tenantId);
    }

    const response = await fetch(`${this.baseUrl}/v1/exports/${exportId}/download`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const disposition = response.headers.get("content-disposition") ?? "";
    const filenameMatch = disposition.match(/filename=\"(.+)\"/);
    const filename = filenameMatch?.[1] ?? `${exportId}.bin`;

    return {
      filename,
      blob: await response.blob()
    };
  }

  async getTenantProfile(): Promise<TenantProfile> {
    const response = await this.request<{ item: TenantProfile }>(`/v1/tenants/me`);
    return response.item;
  }

  async toggleLegacyModule(moduleName: string, enabled: boolean): Promise<{
    module: string;
    enabled: boolean;
  }> {
    return this.request<{ module: string; enabled: boolean }>(
      `/api/modules/${moduleName}/toggle`,
      {
        method: "POST",
        body: JSON.stringify({ enabled })
      }
    );
  }

  async memorySearch(query: string, limit = 10): Promise<MemorySearchResult[]> {
    const response = await this.request<{ items: MemorySearchResult[] }>(`/api/memory/search`, {
      method: "POST",
      body: JSON.stringify({ query, limit })
    });
    return response.items;
  }
}
