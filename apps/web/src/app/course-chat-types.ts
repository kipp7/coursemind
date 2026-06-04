export type WorkspacePanel = "materials" | "teacher" | "audit";

export type ChatMessage = {
  id: string;
  kind: "user" | "assistant";
  text: string;
  sources?: string[];
};
