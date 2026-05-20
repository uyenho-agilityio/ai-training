"use client";

import { TodoList } from "@/components";

export default function Page() {
  return (
    <main className="todos-page">
      <div className="todos-container">
        <h1 className="todos-title">✍️ My Todos</h1>
        <TodoList />
      </div>
    </main>
  );
}
