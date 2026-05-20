export const cloneMessages = <T>(messages: T[]): T[] => {
  try {
    return structuredClone(messages);
  } catch {
    return JSON.parse(JSON.stringify(messages)) as T[];
  }
};
