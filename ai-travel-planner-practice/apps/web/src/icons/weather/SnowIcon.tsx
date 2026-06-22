"use client";

import { memo, type ReactElement } from "react";

import { EmojiIcon } from "../EmojiIcon";
import type { IconProps } from "../types";

const SnowIconComponent = (props: IconProps): ReactElement => (
  <EmojiIcon emoji="❄️" {...props} />
);

export const SnowIcon = memo(SnowIconComponent);
