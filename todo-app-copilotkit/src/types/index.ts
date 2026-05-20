export type TodoStatus = "todo" | "in_progress" | "done";

export type TodoItem = {
  text: string;
  status: TodoStatus;
  taskNumber: number;
};

export type Todo = { id: string } & TodoItem;

export type UpdatedTodoItem = { id: string } & Partial<TodoItem>;

type ToolStatus = "inProgress" | "executing" | "complete";

export type TodoToolStatusLabels = {
  inProgress: string;
  executing: string;
  complete?: string;
};

export type TodoToolStatusProps = {
  status: ToolStatus;
  args: Record<string, unknown>;
  result?: string;
  labels: TodoToolStatusLabels;
};

export type TodoToolRenderProps = {
  status: ToolStatus;
  args: Record<string, unknown>;
  result?: string;
};
