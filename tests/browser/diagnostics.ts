import type { Page, TestInfo, Request } from '@playwright/test';
import { homeHeroVideoPath } from '../../src/content/home/media';

export function isNavigationCancellation({
  url,
  currentUrl,
  reason,
  resourceType,
  allowedPaths,
}: {
  url: string;
  currentUrl: string;
  reason: string;
  resourceType: string;
  allowedPaths: readonly string[];
}): boolean {
  const target = new URL(url);
  return (
    resourceType === 'fetch' &&
    target.origin === new URL(currentUrl).origin &&
    target.searchParams.has('_rsc') &&
    allowedPaths.includes(decodeURI(target.pathname)) &&
    ['net::ERR_ABORTED', 'NS_BINDING_ABORTED', 'cancelled'].includes(reason)
  );
}

/** Keep intentional router refresh cancellations visible without hiding required-resource errors. */
export function collectPageDiagnostics(page: Page, allowedRscPaths: readonly string[] = []) {
  const errors: string[] = [];
  const cancellations: string[] = [];
  const successfulMediaRanges = new WeakSet<Request>();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    const failure = `${request.url()}: ${request.failure()?.errorText}`;
    if (
      isNavigationCancellation({
        url: request.url(),
        currentUrl: page.url(),
        reason: request.failure()?.errorText ?? '',
        resourceType: request.resourceType(),
        allowedPaths: allowedRscPaths,
      }) ||
      (successfulMediaRanges.has(request) &&
        ['net::ERR_ABORTED', 'NS_BINDING_ABORTED', 'cancelled'].includes(
          request.failure()?.errorText ?? '',
        ))
    )
      cancellations.push(failure);
    else errors.push(failure);
  });
  page.on('response', (response) => {
    const request = response.request();
    const url = new URL(response.url());
    // HTML video probes/cancels byte ranges while finding metadata or pausing.
    // Only a successful 206 for this exact local video qualifies, never a load error.
    if (
      response.status() === 206 &&
      request.resourceType() === 'media' &&
      request.headers()['range'] &&
      url.origin === new URL(page.url()).origin &&
      url.pathname === homeHeroVideoPath
    )
      successfulMediaRanges.add(request);
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  return {
    errors,
    attachCancellations: (info: TestInfo) =>
      info.attach('navigation-cancellations.json', {
        body: JSON.stringify(cancellations),
        contentType: 'application/json',
      }),
  };
}
