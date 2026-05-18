import { z } from "zod";

const todoItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCompleted: z.boolean(),
  taskNumber: z.number().optional(),
});

export const updateTodoListSchema = z.object({
  items: z.array(todoItemSchema),
});

export const deleteTodoSchema = z.object({
  id: z.string(),
});
