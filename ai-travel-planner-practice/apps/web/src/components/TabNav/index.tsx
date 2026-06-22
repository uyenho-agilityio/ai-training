"use client";

import { memo, useCallback, type MouseEvent, type ReactElement } from "react";

import { Button } from "../commons";
import { cn } from "@/utils";
import type { Size, TabNavItem } from "@/types";
import {
  tabNavButtonClasses,
  tabNavClasses,
  tabNavInactiveButtonClasses,
} from "./styles";

type TabNavProps = {
  tabs: TabNavItem[];
  activeTab: string;
  className?: string;
  size?: Size;
  formatLabel?: (tab: TabNavItem) => string;
  onTabChange: (tab: string) => void;
};

const TabNavComponent = ({
  tabs,
  activeTab,
  className,
  size = "sm",
  formatLabel,
  onTabChange,
}: TabNavProps): ReactElement => {
  const handleTabClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      const tabId = event.currentTarget?.dataset?.tabId;

      if (!tabId) {
        return;
      }

      onTabChange(tabId);
    },
    [onTabChange],
  );

  return (
    <nav
      className={className ? `${tabNavClasses} ${className}` : tabNavClasses}
    >
      {tabs.map((tab: TabNavItem) => {
        const isActive: boolean = activeTab === tab.id;

        return (
          <Button
            data-tab-id={tab.id}
            key={tab.id}
            size={size}
            variant={isActive ? "primary" : "secondary"}
            className={cn(
              tabNavButtonClasses,
              !isActive && tabNavInactiveButtonClasses,
            )}
            onClick={handleTabClick}
          >
            {formatLabel ? formatLabel(tab) : tab.label}
          </Button>
        );
      })}
    </nav>
  );
};

export const TabNav = memo(TabNavComponent);
