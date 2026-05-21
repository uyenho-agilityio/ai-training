import { z } from "zod";

import type { TodoItem, UpdatedTodoItem } from "@/types";

export const todoStatusSchema = z.enum(["todo", "in_progress", "done"]);

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use ISO date YYYY-MM-DD");

export const todoItemSchema = z.object({
  text: z.string(),
  status: todoStatusSchema,
  taskNumber: z.number(),
  startDate: isoDateSchema.optional(),
  dueDate: isoDateSchema.optional(),
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
