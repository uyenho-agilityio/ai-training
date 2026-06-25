"use client";

import { memo, useCallback, type ReactElement } from "react";

import { cn } from "@/utils";
import { Button, Heading, Text } from "../commons";
import type { Size } from "@/types";
import {
  confirmationActionsClasses,
  confirmationClasses,
  confirmationInlineActionsClasses,
  confirmationInlineModalClasses,
} from "./styles";

type ConfirmationVariant = "modal" | "inline";

type ConfirmationProps = {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: Size;
  variant?: ConfirmationVariant;
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
  variant = "modal",
  className,
  onConfirm,
  onCancel,
}: ConfirmationProps): ReactElement => {
  const isInline = variant === "inline";

  const handleConfirm = useCallback((): void => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback((): void => {
    onCancel();
  }, [onCancel]);

  const resolvedSize: Size = isInline ? "sm" : size;
  const containerClasses = isInline
    ? confirmationInlineModalClasses
    : confirmationClasses;
  const actionsClasses = isInline
    ? confirmationInlineActionsClasses
    : confirmationActionsClasses;

  return (
    <div
      className={cn(containerClasses, className)}
      {...(isInline && {
        role: "dialog",
        "aria-modal": true,
        "aria-label": message,
      })}
    >
      {!isInline && title && (
        <Heading variant="h3" size="sm" color="primary">
          {title}
        </Heading>
      )}

      <Text
        size={isInline ? "xs" : "sm"}
        className={cn("font-medium leading-relaxed")}
      >
        {message}
      </Text>

      <div className={actionsClasses}>
        <Button variant="secondary" size={resolvedSize} onClick={handleCancel}>
          {cancelLabel}
        </Button>

        <Button size={resolvedSize} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
};

export const Confirmation = memo(ConfirmationComponent);
