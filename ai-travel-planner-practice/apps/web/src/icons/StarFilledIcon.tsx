"use client";

import { memo, type ReactElement } from "react";

import { EmojiIcon } from "./EmojiIcon";
import type { IconProps } from "./types";

const StarFilledIconComponent = (props: IconProps): ReactElement => (
  <EmojiIcon emoji="★" {...props} />
);

export const StarFilledIcon = memo(StarFilledIconComponent);
