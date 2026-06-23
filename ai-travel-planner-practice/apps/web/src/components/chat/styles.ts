export const copilotThemeClasses: string =
  "[--copilot-kit-primary-color:#ea580c] [--copilot-kit-background-color:#fffbf7] [--copilot-kit-input-background-color:#ffffff] [--copilot-kit-separator-color:#fed7aa]";

export const copilotChatClasses: string = `flex h-full min-h-0 flex-col ${copilotThemeClasses}`;

export const copilotSidebarClasses: string = copilotThemeClasses;

/** Shared layout classes for chat message bubbles. */
export const chatMessageRowClasses: string = "mb-3 flex w-full";

export const userMessageRowClasses: string = `${chatMessageRowClasses} justify-end`;

export const systemMessageRowClasses: string = `${chatMessageRowClasses} justify-start`;

/** Shared message typography — middle size between text-sm and markdown default. */
export const chatMessageFontClasses: string =
  "text-[15px] font-medium leading-relaxed";

/** Normalizes CopilotKit markdown font size inside assistant bubbles. */
export const chatMessageMarkdownClasses: string =
  "[&_.copilotKitParagraph]:!text-[15px] [&_.copilotKitParagraph]:!leading-relaxed [&_.copilotKitMarkdown]:!text-[15px] [&_.copilotKitMarkdownElement]:!text-[15px]";

/** User bubble — orange gradient aligned with app primary actions. */
export const userMessageBubbleClasses: string = `max-w-[85%] rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 px-5 py-3 text-white shadow-sm shadow-orange-100 ${chatMessageFontClasses}`;

/** Assistant bubble — warm off-white using app orange tint. */
export const systemMessageBubbleClasses: string = `max-w-[85%] rounded-2xl border border-orange-100 bg-orange-50 px-5 py-3 text-slate-800 ${chatMessageFontClasses} ${chatMessageMarkdownClasses}`;

/** Typing indicator bubble — matches assistant message styling. */
export const typingIndicatorBubbleClasses: string =
  "inline-flex items-center gap-1 rounded-2xl border border-orange-100 bg-orange-50 px-5 py-3";

/** Chat input container — textarea + send button, vertically centered. */
export const chatInputContainerClasses: string =
  "flex items-center gap-2 rounded-3xl border border-slate-200 bg-white py-2 pl-4 pr-2 shadow-sm";

export const chatInputTextareaClasses: string =
  "h-10 max-h-10 min-h-10 flex-1 resize-none overflow-y-auto border-0 bg-transparent py-2.5 text-sm font-medium leading-5 text-slate-800 placeholder:text-slate-400 focus:outline-none";
