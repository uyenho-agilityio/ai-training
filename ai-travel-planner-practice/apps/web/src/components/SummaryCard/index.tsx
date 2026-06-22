"use client";

import { memo, type ReactElement, type ReactNode } from "react";

import { Button, Card, Heading, Text } from "../commons";

type SummaryCardProps = {
  title: string;
  actionLabel?: string;
  children?: ReactNode;
  message?: string;
  isEmpty?: boolean;
  className?: string;
  onAction?: () => void;
};

const SummaryCardComponent = ({
  title,
  actionLabel,
  children,
  message,
  isEmpty = false,
  className,
  onAction,
}: SummaryCardProps): ReactElement => (
  <Card className={className ?? "rounded-xl"}>
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <Heading
        variant="h6"
        size="xs"
        color="accent"
        className="uppercase tracking-wider"
      >
        {title}
      </Heading>

      {actionLabel && onAction && (
        <Button variant="ghost" size="xs" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>

    {isEmpty && message ? (
      <Text size="xs" color="muted" className="font-medium">
        {message}
      </Text>
    ) : (
      children
    )}
  </Card>
);

export const SummaryCard = memo(SummaryCardComponent);
