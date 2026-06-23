"use client";

import { memo, type ReactElement } from "react";

import { Badge, Card, Heading, Text } from "../commons";

type HeaderProps = {
  label?: string;
  title: string;
  chips?: string[];
  className?: string;
};

const HeaderComponent = ({
  label = "AI TRAVEL PLANNER",
  title,
  chips = [],
  className,
}: HeaderProps): ReactElement => (
  <Card className={className ?? "shrink-0 space-y-3 sm:p-5"}>
    <div>
      <Text
        isBold
        size="xs"
        color="accent"
        className="uppercase tracking-wider text-orange-500"
      >
        {label}
      </Text>

      <Heading variant="h1" size="xl" className="sm:text-2xl">
        {title}
      </Heading>
    </div>

    {chips.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {chips.map((chip: string) => (
          <Badge key={chip} variant="outline">
            {chip}
          </Badge>
        ))}
      </div>
    )}
  </Card>
);

export const Header = memo(HeaderComponent);
