import type { ReactElement, ReactNode } from "react";

export const isVisibleMessage = (node: ReactNode): boolean => {
  if (node == null || node === false) {
    return false;
  }

  if (typeof node === "string") {
    return node.trim().length > 0;
  }

  if (typeof node === "number") {
    return true;
  }

  if (Array.isArray(node)) {
    return node.length > 0 && node.some(isVisibleMessage);
  }

  if (typeof node === "object" && "props" in node) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    const { children } = element.props;

    if (children == null) {
      return false;
    }

    if (Array.isArray(children)) {
      return children.some(isVisibleMessage);
    }

    return isVisibleMessage(children);
  }

  return true;
};
