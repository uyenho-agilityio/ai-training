"use client";

import { memo, type ReactElement } from "react";

import { EmojiIcon } from "../EmojiIcon";
import type { IconProps } from "../types";

const DrizzleIconComponent = (props: IconProps): ReactElement => (
  <EmojiIcon emoji="🌦️" {...props} />
);

export const DrizzleIcon = memo(DrizzleIconComponent);
