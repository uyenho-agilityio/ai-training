"use client";

import { memo, type ReactElement } from "react";

import { EmojiIcon } from "./EmojiIcon";
import type { IconProps } from "./types";

const ChevronUpIconComponent = (props: IconProps): ReactElement => (
  <EmojiIcon emoji="▲" {...props} />
);

export const ChevronUpIcon = memo(ChevronUpIconComponent);
