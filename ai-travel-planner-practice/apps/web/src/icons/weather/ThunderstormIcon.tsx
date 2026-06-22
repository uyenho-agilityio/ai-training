"use client";

import { memo, type ReactElement } from "react";

import { EmojiIcon } from "../EmojiIcon";
import type { IconProps } from "../types";

const ThunderstormIconComponent = (props: IconProps): ReactElement => (
  <EmojiIcon emoji="⛈️" {...props} />
);

export const ThunderstormIcon = memo(ThunderstormIconComponent);
