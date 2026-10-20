import content from './home.generated.json' with { type: 'json' };

// Owner-directed curation: preserve the featured quote and the three specific
// website/marketing/ERP accounts. Keep all original quotes in recovered evidence.
const retainedIds = ['e925188', '187bcc8', '089b3bd', '1c6e845'] as const;

export const homepageReviews = retainedIds.map((sourceId) => {
  const review = content.reviews.find((item) => item.sourceId === sourceId);
  if (!review) throw new Error(`Missing selected homepage testimonial: ${sourceId}`);
  return review;
});
