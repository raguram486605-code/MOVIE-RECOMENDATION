import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export function analyzeSentiment(rating, text = '') {
  const lower = (text || '').toLowerCase();
  const posKeywords = ['great', 'awesome', 'amazing', 'excellent', 'love', 'loved', 'fantastic', 'masterpiece', 'brilliant', 'good', 'enjoyed', 'best', 'super', 'wonderful', 'perfect', 'mind-blowing', 'top', 'epic', 'stunning', 'nice'];
  const negKeywords = ['bad', 'boring', 'worst', 'terrible', 'awful', 'waste', 'horrible', 'poor', 'disappointing', 'dull', 'lame', 'hate', 'hated', 'sucks', 'flop', 'regret', 'trash', 'overrated'];

  let pos = 0;
  let neg = 0;

  posKeywords.forEach(word => { if (lower.includes(word)) pos++; });
  negKeywords.forEach(word => { if (lower.includes(word)) neg++; });

  if (rating >= 4) {
    return neg > pos + 1 ? 'negative' : 'positive';
  } else if (rating <= 2) {
    return pos > neg + 1 ? 'positive' : 'negative';
  } else {
    if (pos > neg) return 'positive';
    if (neg > pos) return 'negative';
    return 'neutral';
  }
}

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true }));

export const Movie = model('Movie', new Schema({
  title: { type: String, required: true, index: 'text' },
  description: String,
  genres: [String],
  languages: [String],
  year: Number,
  director: String,
  cast: [String],
  poster: String,
  logo: String,
  backdrop: String,
  trailer: String, // YouTube embed link / video ID
  streamingSources: [{
    platform: String,
    accessType: String, // 'Stream (Subscription)', 'Rent / Buy', etc.
    url: String,
    icon: String
  }],
  theaters: [{
    id: String,
    name: String,
    location: String,
    screenTypes: [String],
    showtimes: [String],
    ticketPrice: Number
  }],
  downloadOptions: [{
    quality: String,
    size: String,
    format: String,
    downloadUrl: String
  }]
}, { timestamps: true }));

const reviewSchema = new Schema({
  movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, default: '', maxlength: 2000 },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
}, { timestamps: true });
reviewSchema.index({ movie: 1, user: 1 }, { unique: true }); // one review per user per movie

reviewSchema.pre('validate', function (next) {
  if (typeof this.rating === 'number') {
    this.sentiment = analyzeSentiment(this.rating, this.text);
  }
  if (typeof next === 'function') next();
});
export const Review = model('Review', reviewSchema);
