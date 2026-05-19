export type TodoItem = {
  text: string;
  isCompleted: boolean;
  taskNumber: number;
};

export type Todo = { id: string } & TodoItem;

export type UpdatedTodoItem = { id: string } & Partial<TodoItem>;
