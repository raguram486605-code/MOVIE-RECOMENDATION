import { Movie, Review } from './models.js';

// Prior: assume a movie with no reviews is 50% positive, worth PRIOR_WEIGHT reviews.
// This keeps a single 5-star review from outranking a movie with 200 reviews at 95%.
const PRIOR_WEIGHT = 5, PRIOR_RATE = 0.5;

// Per-movie stats: count, average rating, positive/negative/neutral counts and percentages, recommendation score
export async function movieStats(match = {}) {
  const rows = await Review.aggregate([
    { $match: match },
    { $group: {
      _id: '$movie',
      reviewCount: { $sum: 1 },
      avgRating: { $avg: '$rating' },
      positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
      negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
      neutral: { $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] } },
    } },
  ]);
  const map = new Map();
  for (const r of rows) {
    if (!r._id) continue;
    const positivePct = (r.positive / r.reviewCount) * 100;
    const negativePct = (r.negative / r.reviewCount) * 100;
    const score = (r.positive + PRIOR_WEIGHT * PRIOR_RATE) / (r.reviewCount + PRIOR_WEIGHT);
    map.set(String(r._id), {
      reviewCount: r.reviewCount, avgRating: +(r.avgRating || 0).toFixed(2),
      positive: r.positive, negative: r.negative, neutral: r.neutral || 0,
      positivePct: +positivePct.toFixed(1), negativePct: +negativePct.toFixed(1),
      score: +score.toFixed(4),
    });
  }
  return map;
}
export const emptyStats = { reviewCount: 0, avgRating: 0, positive: 0, negative: 0, neutral: 0, positivePct: 0, negativePct: 0, score: PRIOR_RATE };

// Ranks by score (positive % smoothed by review count); ties broken by positive count
export async function recommendations(limit = 10, { exclude = [], genres, languages } = {}) {
  const cleanExclude = exclude.filter(Boolean);
  const stats = await movieStats();
  const q = cleanExclude.length ? { _id: { $nin: cleanExclude } } : {};
  if (genres?.length) q.genres = { $in: genres };
  if (languages?.length) q.languages = { $in: languages };
  const movies = await Movie.find(q).lean();
  return movies
    .map(m => ({ ...m, stats: stats.get(String(m._id)) || emptyStats }))
    .filter(m => m.stats.reviewCount > 0)
    .sort((a, b) => b.stats.score - a.stats.score || b.stats.positive - a.stats.positive)
    .slice(0, limit);
}
