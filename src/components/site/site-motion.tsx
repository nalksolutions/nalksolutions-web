'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { mountEntrances } from './motion-controller';

/** Enhancement only: server content and its final layout never depend on this component. */
export function SiteMotion() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  useEffect(() => mountEntrances(document), [pathname, query]);
  return null;
}
