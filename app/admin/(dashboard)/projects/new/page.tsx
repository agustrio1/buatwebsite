import { ProjectForm } from "~/components/admin/project-form";
import { createProject } from "../actions";

export default function NewProject() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tambah Portofolio</h1>
      <ProjectForm action={createProject} />
    </div>
  );
}
