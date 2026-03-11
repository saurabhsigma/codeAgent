"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllProjects, deleteProject } from "@/lib/api";

type Project = {
  projectId: string;
  name: string;
  description: string;
  prompt: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getAllProjects();
      setProjects(data.projects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.projectId !== projectId));
    } catch (error) {
      alert("Failed to delete project");
    }
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">✨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Website Builder</h1>
              <p className="text-sm text-gray-400">Your Projects</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push("/builder")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition shadow-lg shadow-purple-500/50"
          >
            + New Project
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-gray-400 mb-8">
              {searchQuery ? "Try a different search term" : "Create your first AI-generated website"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/builder")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition shadow-lg"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.projectId}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {/* Preview Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-600/20 to-pink-600/20 overflow-hidden">
                  <iframe
                    src={`/api/projects/${project.projectId}/preview/index.html`}
                    title={project.name}
                    className="w-full h-full pointer-events-none scale-50 origin-top-left transform"
                    style={{ width: "200%", height: "200%" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {project.description || project.prompt}
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/builder?project=${project.projectId}`)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Edit
                    </button>
                    <a
                      href={`/api/projects/${project.projectId}/preview/index.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-purple-600/80 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition text-center"
                    >
                      Preview
                    </a>
                    <button
                      onClick={() => handleDelete(project.projectId)}
                      className="bg-red-600/20 hover:bg-red-600/40 text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
