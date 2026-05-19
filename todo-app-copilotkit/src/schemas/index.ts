import { z } from "zod";

import type { TodoItem, UpdatedTodoItem } from "@/types";

export const todoItemSchema = z.object({
  text: z.string(),
  isCompleted: z.boolean(),
  taskNumber: z.number(),
}) satisfies z.ZodType<TodoItem>;

export const updatedTodoItemSchema = z
  .object({ id: z.string() })
  .extend(todoItemSchema.partial().shape) satisfies z.ZodType<UpdatedTodoItem>;

export const todosSchema = z.object({
  items: z.array(updatedTodoItemSchema),
});

export const deleteTodoSchema = z.object({
  id: z.string(),
});
