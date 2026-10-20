'use client';

import { useEffect, useRef, type HTMLAttributes } from 'react';
import { mountTabs } from './tabs-controller';

/** Server-rendered slots stay readable without JS; enhancement owns only tab state. */
export function ContentTabs({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return mountTabs(root.current);
  }, [children]);
  return (
    <div {...props} ref={root} className="content-service-tabs">
      {children}
    </div>
  );
}
