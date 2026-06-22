"use client";

import {
  memo,
  useCallback,
  useEffect,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/utils";
import { modalBackdropClasses, modalContentClasses } from "./styles";

type ModalProps = {
  className?: string;
  children: ReactNode;
  onClose: () => void;
};

const ModalComponent = ({
  className,
  children,
  onClose,
}: ModalProps): ReactElement => {
  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="presentation"
      className={modalBackdropClasses}
      onClick={handleBackdropClick}
    >
      <div className={cn(modalContentClasses, className)}>{children}</div>
    </div>
  );
};

export const Modal = memo(ModalComponent);
