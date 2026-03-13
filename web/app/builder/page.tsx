import { Builder } from "@/components/builder";
import { WorkspaceGate } from "@/components/workspace-gate";

export default function BuilderPage() {
  return (
    <WorkspaceGate>
      <Builder />
    </WorkspaceGate>
  );
}
