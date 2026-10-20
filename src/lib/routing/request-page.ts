import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { readPageDocument, readPublishedPages } from '../../content/repository';
import { PUBLIC_PATH_HEADER } from '../env/config';
import { resolvePage } from './resolve';

/** React owns request-local deduplication; Proxy and rendering share no process state. */
export const getRequestContent = cache(async () => {
  const pathname = (await headers()).get(PUBLIC_PATH_HEADER);
  if (!pathname) notFound();
  const pages = await readPublishedPages();
  const result = resolvePage(pathname, pages);
  if (result.kind !== 'page') notFound();
  return { page: result.page, pages, document: await readPageDocument(result.page, pages) };
});

export const getRequestPage = async () => (await getRequestContent()).page;
