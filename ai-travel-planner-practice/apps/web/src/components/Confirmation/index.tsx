"use client";

import { memo, useCallback, type ReactElement } from "react";

import { cn } from "@/utils";
import { Button, Heading, Text } from "../commons";
import type { Size } from "@/types";
import { confirmationActionsClasses, confirmationClasses } from "./styles";

type ConfirmationProps = {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: Size;
  isDialog?: boolean;
  className?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationComponent = ({
  title = "Confirmation",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  size = "md",
  isDialog = false,
  className,
  onConfirm,
  onCancel,
}: ConfirmationProps): ReactElement => {
  const handleConfirm = useCallback((): void => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback((): void => {
    onCancel();
  }, [onCancel]);

  return (
    <div
      className={cn(confirmationClasses, className)}
      {...(isDialog && {
        role: "dialog",
        "aria-modal": true,
        "aria-label": title,
      })}
    >
      <Heading variant="h3" size="sm" color="primary">
        {title}
      </Heading>

      <Text size="sm" className="font-medium leading-relaxed">
        {message}
      </Text>

      <div className={confirmationActionsClasses}>
        <Button variant="secondary" size={size} onClick={handleCancel}>
          {cancelLabel}
        </Button>

        <Button size={size} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
};

export const Confirmation = memo(ConfirmationComponent);
