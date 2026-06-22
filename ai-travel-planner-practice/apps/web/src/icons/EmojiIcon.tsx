"use client";

import { memo, type ReactElement } from "react";

import { cn } from "@/utils";
import { ICON_DEFAULT_SIZE, type IconProps } from "./types";

type EmojiIconProps = IconProps & {
  emoji: string;
};

const EmojiIconComponent = ({
  emoji,
  size = ICON_DEFAULT_SIZE,
  className,
}: EmojiIconProps): ReactElement => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center justify-center leading-none",
      className,
    )}
    style={{ fontSize: size, width: size, height: size }}
    aria-hidden
  >
    {emoji}
  </span>
);

export const EmojiIcon = memo(EmojiIconComponent);
