"use client";

import { memo, type ReactElement } from "react";

import { EmojiIcon } from "./EmojiIcon";
import type { IconProps } from "./types";

const StarOutlineIconComponent = (props: IconProps): ReactElement => (
  <EmojiIcon emoji="☆" {...props} />
);

export const StarOutlineIcon = memo(StarOutlineIconComponent);
