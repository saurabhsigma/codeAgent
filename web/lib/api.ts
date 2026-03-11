const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ProjectResponse = {
  projectId: string;
  name: string;
  files: string[];
  previewUrl: string;
  createdAt: string;
};

type ProjectListItem = {
  projectId: string;
  name: string;
  description: string;
  prompt: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
};

type FileResponse = {
  path: string;
  content: string;
};

type ProjectFilesResponse = {
  projectId: string;
  files: string[];
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallbackMessage = "Request failed.";
    let errorMessage = fallbackMessage;

    try {
      const error = (await response.json()) as { error?: string };
      errorMessage = error.error ?? fallbackMessage;
    } catch {
      errorMessage = fallbackMessage;
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function createProject(prompt: string, name?: string) {
  const response = await fetch(`${apiBaseUrl}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, name }),
  });

  return handleResponse<ProjectResponse>(response);
}

export async function getAllProjects() {
  const response = await fetch(`${apiBaseUrl}/api/projects`);
  return handleResponse<{ projects: ProjectListItem[] }>(response);
}

export async function updateProjectMetadata(projectId: string, name: string, description?: string) {
  const response = await fetch(`${apiBaseUrl}/api/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });

  return handleResponse<{ ok: boolean }>(response);
}

export async function deleteProject(projectId: string) {
  const response = await fetch(`${apiBaseUrl}/api/projects/${projectId}`, {
    method: "DELETE",
  });

  return handleResponse<{ ok: boolean }>(response);
}

export async function editProject(projectId: string, prompt: string) {
  const response = await fetch(`${apiBaseUrl}/api/projects/${projectId}/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  return handleResponse<ProjectResponse>(response);
}

export async function getProject(projectId: string) {
  const response = await fetch(`${apiBaseUrl}/api/projects/${projectId}`);
  return handleResponse<ProjectFilesResponse>(response);
}

export async function getProjectFile(projectId: string, filePath: string) {
  const url = new URL(`${apiBaseUrl}/api/projects/${projectId}/file`);
  url.searchParams.set("path", filePath);

  const response = await fetch(url.toString());
  return handleResponse<FileResponse>(response);
}

export async function saveProjectFile(
  projectId: string,
  filePath: string,
  content: string,
) {
  const response = await fetch(`${apiBaseUrl}/api/projects/${projectId}/file`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: filePath, content }),
  });

  return handleResponse<{ ok: boolean }>(response);
}

export function getPreviewUrl(projectId: string) {
  return `${apiBaseUrl}/api/projects/${projectId}/preview/index.html`;
}

export function getDownloadUrl(projectId: string) {
  return `${apiBaseUrl}/api/projects/${projectId}/download`;
}
