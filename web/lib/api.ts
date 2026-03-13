const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type ProjectListItem = {
  projectId: string;
  name: string;
  ownerName: string;
  description: string;
  prompt: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  previewUrl: string;
  sharePath: string;
};

export type ProjectResponse = ProjectListItem & {
  files: string[];
};

type FileResponse = {
  path: string;
  content: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthSession = AuthUser & {
  token: string;
};

export const sessionStorageKey = "studio-session";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(sessionStorageKey);

    if (!raw) {
      return {};
    }

    const session = JSON.parse(raw) as AuthSession;

    if (!session?.token) {
      return {};
    }

    return {
      Authorization: `Bearer ${session.token}`,
    };
  } catch {
    return {};
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallbackMessage = "Request failed.";

    try {
      const error = (await response.json()) as { error?: string };
      throw new Error(error.error ?? fallbackMessage);
    } catch (error) {
      throw error instanceof Error ? error : new Error(fallbackMessage);
    }
  }

  return (await response.json()) as T;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const workspaceHeaders = getAuthHeaders();

  Object.entries(workspaceHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  return handleResponse<T>(response);
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function apiSignup(name: string, email: string, password: string) {
  return fetchApi<{ token: string; user: AuthUser }>("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiLogin(email: string, password: string) {
  return fetchApi<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function apiMe(token: string) {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ user: AuthUser }>(response);
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function createProject(
  prompt: string,
  name?: string,
  description?: string,
) {
  return fetchApi<ProjectResponse>("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, name, description }),
  });
}

export async function getAllProjects() {
  return fetchApi<{ projects: ProjectListItem[] }>("/api/projects");
}

export async function getProject(projectId: string) {
  return fetchApi<ProjectResponse>(`/api/projects/${projectId}`);
}

export async function getPublicProject(projectId: string) {
  return fetchApi<ProjectResponse>(`/api/public/projects/${projectId}`);
}

export async function updateProjectMetadata(
  projectId: string,
  payload: { name?: string; description?: string; isPublic?: boolean },
) {
  return fetchApi<{ ok: boolean; project: ProjectListItem }>(
    `/api/projects/${projectId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function toggleProjectSharing(projectId: string, isPublic: boolean) {
  return fetchApi<{ ok: boolean; project: ProjectListItem }>(
    `/api/projects/${projectId}/share`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isPublic }),
    },
  );
}

export async function deleteProject(projectId: string) {
  return fetchApi<{ ok: boolean }>(`/api/projects/${projectId}`, {
    method: "DELETE",
  });
}

export async function editProject(projectId: string, prompt: string) {
  return fetchApi<ProjectResponse>(`/api/projects/${projectId}/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
}

export async function getProjectFile(projectId: string, filePath: string) {
  const url = new URL(`${apiBaseUrl}/api/projects/${projectId}/file`);
  url.searchParams.set("path", filePath);

  const response = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse<FileResponse>(response);
}

export async function saveProjectFile(
  projectId: string,
  filePath: string,
  content: string,
) {
  return fetchApi<{ ok: boolean; updatedAt: string }>(
    `/api/projects/${projectId}/file`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: filePath, content }),
    },
  );
}

export function getPreviewUrl(projectId: string, filePath = "index.html") {
  return `${apiBaseUrl}/api/projects/${projectId}/preview/${filePath}`;
}

export function getDownloadUrl(projectId: string) {
  return `${apiBaseUrl}/api/projects/${projectId}/download`;
}
