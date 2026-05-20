import { z } from "zod";

import type { TodoItem, UpdatedTodoItem } from "@/types";

export const todoStatusSchema = z.enum(["todo", "in_progress", "done"]);

export const todoItemSchema = z.object({
  text: z.string(),
  status: todoStatusSchema,
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

export const clearTodosSchema = z.object({});
