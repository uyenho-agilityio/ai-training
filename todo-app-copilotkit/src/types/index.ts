export type TodoItem = {
  text: string;
  isCompleted: boolean;
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
