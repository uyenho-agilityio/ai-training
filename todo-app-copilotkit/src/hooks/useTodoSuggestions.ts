"use client";

import { useMemo } from "react";
import { useConfigureSuggestions, useAgent } from "@copilotkit/react-core/v2";

import type { Todo } from "@/types";

const buildWelcomeSuggestions = (todos: Todo[]) => {
  if (todos.length === 0) {
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

  const incomplete = todos.filter((t) => !t.isCompleted);

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

const buildDynamicInstructions = (todos: Todo[]) => {
  const summary = JSON.stringify(todos);
  const incompleteCount = todos.filter((t) => !t.isCompleted).length;

  return [
    "You are helping a user manage their todo list in a todo app.",
    `Current todos (${todos.length} total, ${incompleteCount} incomplete):`,
    JSON.stringify(summary, null, 2),
    "Suggest short, actionable prompts the user might send next.",
    "Focus on adding, completing, organizing, prioritizing, or cleaning up todos.",
    "Keep each title under 40 characters.",
    "Each message should be a full natural sentence the user would type in chat.",
  ].join("\n");
};

export const useTodoSuggestions = (todos: Todo[]) => {
  const { agent } = useAgent();
  const hasMessages = (agent?.messages?.length ?? 0) > 0;

  const welcomeSuggestions = useMemo(
    () => buildWelcomeSuggestions(todos),
    [todos]
  );

  const dynamicInstructions = useMemo(
    () => buildDynamicInstructions(todos),
    [todos]
  );

  useConfigureSuggestions(
    hasMessages
      ? null
      : { suggestions: welcomeSuggestions, available: "before-first-message" },

    [welcomeSuggestions, hasMessages]
  );

  useConfigureSuggestions(
    hasMessages
      ? {
          instructions: dynamicInstructions,
          minSuggestions: 1,
          maxSuggestions: 2,
          available: "after-first-message",
          providerAgentId: "default",
        }
      : null,
    [dynamicInstructions]
  );
};
