import { Sidebar } from "@/components/sidebar";
import { projects } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <div className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Projects
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Manage clients, projects, and task scopes.
          </h1>
          <div className="mt-8 grid gap-4">
            {projects.map((project) => (
              <article
                key={project.code}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-mono text-sm text-[var(--accent)]">{project.code}</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">
                      {project.name}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Client: {project.client}
                    </p>
                  </div>
                  <div className="text-sm text-white/80">
                    Budget: {project.budget}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
