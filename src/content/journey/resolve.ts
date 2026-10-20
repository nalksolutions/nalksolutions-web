import type { ProofPage } from '../schema';
import { offers, offerForService } from './offers';
import { articleAssignments } from './articles';
import { arabicOnlyServiceParents } from './arabic';

export function publishedTarget(pages: readonly ProofPage[], id: string) {
  const page = pages.find((page) => page.id === id);
  if (!page || page.locale !== 'en' || page.status !== 'published')
    throw new Error(`Missing published English journey target: ${id}`);
  return page;
}

/** No fixture cache: validate against this request's current published identities. */
export function validateJourney(pages: readonly ProofPage[]) {
  const seen = new Set<string>();
  for (const offer of offers) {
    for (const id of [offer.pageId, ...offer.specialists.map((item) => item.pageId)]) {
      if (seen.has(id)) throw new Error(`Duplicate journey membership: ${id}`);
      seen.add(id);
      publishedTarget(pages, id);
    }
    for (const id of offer.featured)
      if (!offer.specialists.some((item) => item.pageId === id))
        throw new Error(`Invalid featured specialist: ${id}`);
  }
  for (const id of Object.keys(articleAssignments)) publishedTarget(pages, id);
}

export function navigationSection(page: Pick<ProofPage, 'id' | 'path' | 'kind'> | undefined) {
  if (!page) return undefined;
  if (offerForService(page.id) || arabicOnlyServiceParents[page.id]) return '/our-services/';
  if (
    page.kind === 'article' ||
    page.path.startsWith('/category/') ||
    page.path.startsWith('/author/')
  )
    return '/blog/';
  return page.path;
}
