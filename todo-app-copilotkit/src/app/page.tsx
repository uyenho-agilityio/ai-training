"use client";

import { ApiKeyModal, TodoList } from "@/components";
import { useApiKey } from "@/hooks";

export default function Page() {
  const { apiKey, hasApiKey, maskApiKey, handleSaveKey } = useApiKey();

  return (
    <main className="todos-page">
      <div className="todos-container">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="todos-title mb-0">✍️ My Todos</h1>
          <ApiKeyModal
            apiKey={apiKey}
            hasApiKey={hasApiKey}
            maskApiKey={maskApiKey}
            onSave={handleSaveKey}
          />
        </div>

        <TodoList />
      </div>
    </main>
  );
}
