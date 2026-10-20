import { offers, type OfferId } from './offers';

/** Explicit editorial assignments: future publications never inherit a guessed offer. */
export const articleAssignments: Readonly<Record<string, OfferId>> = {
  'R-d1807ec5e0e664a2': 'websites',
  'R-027395e0b1f88c25': 'websites',
  'R-6547eb8369d41431': 'websites',
  'R-d2da8ebda8ecd96b': 'websites',
  'R-2712c37e972510b2': 'software',
  'R-1763d6af248b2200': 'software',
  'R-e8871af3f8742876': 'software',
  'R-fbbead80b209e23c': 'software',
  'R-0e1cd105cb263493': 'software',
  'R-cc6ebeaad95c9e5e': 'software',
  'R-4b3d1ae1a71cffa7': 'software',
  'R-26b412fd98c13a52': 'software',
  'R-19289ea1a50ad37e': 'automation',
  'R-b862c0c7f35eda96': 'automation',
  'R-25fee40374e2e31c': 'automation',
  'R-7d3b2394efb96d27': 'automation',
  'R-15de724c087e16e9': 'marketing',
  'R-2c613d2a5c1ee55a': 'marketing',
  'R-beb9a0ed5a4db3ce': 'marketing',
  'R-5a4fb03e0d7b4c3b': 'marketing',
  'R-dfd53bfc0f0ad146': 'marketing',
  'R-c68b641619de5fdc': 'marketing',
  'R-4ffd91d75c597e33': 'marketing',
  'R-abdabc0cf23404d4': 'marketing',
  'R-1479975e57602920': 'marketing',
  'R-29f69ff6b1371493': 'marketing',
  'R-9f96e046fe483053': 'marketing',
  'R-93442368c6954c93': 'marketing',
  'R-973785951f782140': 'marketing',
  'R-518ad560a778e4f8': 'marketing',
  'R-c417ce86b30e2d17': 'marketing',
  'R-5bd4587bca0b3022': 'marketing',
  'R-4ed78f24068296e3': 'marketing',
  'R-cf30b9f0253b83a0': 'marketing',
  'R-7b1c2739e262abe5': 'marketing',
};

export function offerForArticle(pageId: string) {
  return offers.find((offer) => offer.id === articleAssignments[pageId]);
}
