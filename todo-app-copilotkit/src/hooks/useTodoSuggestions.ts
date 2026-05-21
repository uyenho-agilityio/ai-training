"use client";

import { useMemo } from "react";
import { useConfigureSuggestions, useAgent } from "@copilotkit/react-core/v2";

import type { Todo } from "@/types";

const buildWelcomeSuggestions = (todos: Todo[]) => {
  if (!todos.length) {
    return [
      {
        title: "Add sample todos",
        message: "Add 3 example todos for a productive day",
      },
      {
        title: "How can you help?",
        message: "What can you do with my todo list?",
      },
    ];
  }

  const incomplete = todos.filter((t) => t.status !== "done");

  if (incomplete.length > 0) {
    return [
      {
        title: "Show incomplete",
        message: "List my incomplete todos",
      },
      {
        title: "Mark all done",
        message: "Mark all incomplete todos as completed",
      },
      {
        title: "Add a task",
        message: "Add a new todo: prepare weekly review",
      },
    ];
  }

  return [
    {
      title: "Clear completed",
      message: "Delete all completed todos",
    },
    {
      title: "Add new task",
      message: "Add a todo for tomorrow's standup",
    },
    {
      title: "Summarize list",
      message: "Give me a quick summary of my todo list",
    },
  ];
};

const buildMessageSuggestions = (todos: Todo[]) => {
  const completed = todos.filter((t) => t.status === "done");
  const incomplete = todos.filter((t) => t.status !== "done");

  const pool = [
    {
      title: "Add a task",
      message: "Add a new todo: follow up with the team",
    },
    {
      title: "Edit a task",
      message: "Rename one of my todos to a clearer title",
    },
    {
      title: "Set a due date",
      message: "Set a due date on one specific incomplete todo when I tell you which task",
    },
    {
      title: "Delete a task",
      message: "Delete one todo from my list",
    },
    {
      title: "Mark done a task",
      message: "Mark one of my incomplete todos as completed",
    },
  ];

  if (completed.length > 0) {
    pool.push({
      title: "Clear all completed",
      message: "Delete all todos that are completed",
    });
  }

  if (incomplete.length > 0) {
    pool.push({
      title: "Clear all incomplete",
      message: "Delete all todos that are not completed",
    });
  }

  if (todos.length > 0) {
    pool.push({
      title: "Clear all",
      message: "Clear my entire todo list",
    });
  }

  return pool;
};

export const useTodoSuggestions = (todos: Todo[]) => {
  const { agent } = useAgent();
  const hasMessages = (agent?.messages?.length ?? 0) > 0;

  const welcomeSuggestions = useMemo(
    () => buildWelcomeSuggestions(todos),
    [todos]
  );

  const messageSuggestions = useMemo(
    () => buildMessageSuggestions(todos),
    [todos]
  );

  useConfigureSuggestions(
    hasMessages
      ? {
          suggestions: messageSuggestions,
          available: "after-first-message",
        }
      : {
          suggestions: welcomeSuggestions,
          available: "before-first-message",
        },
    [hasMessages, welcomeSuggestions, messageSuggestions]
  );
};
