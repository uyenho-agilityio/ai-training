"use client";

import { memo, useCallback, type ReactElement } from "react";

import { cn } from "@/utils";
import { Button, Card, Text } from "../commons";
import type { Size, StatusCardVariant } from "@/types";
import {
  statusCardActionClassName,
  statusCardActionVariant,
  statusCardMessageClasses,
  statusCardVariantClasses,
} from "./styles";

type StatusCardProps = {
  variant?: StatusCardVariant;
  size?: Size;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const StatusCardComponent = ({
  variant = "success",
  size = "xs",
  message,
  actionLabel,
  onAction,
}: StatusCardProps): ReactElement => {
  const handleClick = useCallback(() => {
    onAction?.();
  }, [onAction]);

  return (
    <Card className={statusCardVariantClasses[variant]}>
      <Text size={size} className={statusCardMessageClasses[variant]}>
        {message}
      </Text>

      {actionLabel && onAction && (
        <Button
          className={cn("shrink-0 text-xs", statusCardActionClassName[variant])}
          size={size}
          variant={statusCardActionVariant[variant]}
          onClick={handleClick}
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

export const StatusCard = memo(StatusCardComponent);
