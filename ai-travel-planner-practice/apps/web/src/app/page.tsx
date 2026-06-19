import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export default function Home() {
  return (
    <CopilotKit runtimeUrl="http://localhost:4111/chat" agent="weatherAgent">
      <div className="flex min-h-screen w-full flex-col sm:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <main className="flex min-h-screen w-full min-w-0 flex-col gap-4 overflow-y-auto bg-white p-4 sm:gap-5 sm:p-10">
            <div className="shrink-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  AI TRAVEL PLANNER
                </p>

                <h1 className="text-xl font-black text-slate-800 sm:text-2xl">
                  3 days in ...
                </h1>
              </div>
            </div>
          </main>
        </div>

        <CopilotSidebar
          defaultOpen
          clickOutsideToClose={false}
          labels={{
            title: "AI Assistant",
            initial: "Hi! 👋 How can I help you with your travel plans?",
          }}
        />
      </div>
    </CopilotKit>
  );
}
