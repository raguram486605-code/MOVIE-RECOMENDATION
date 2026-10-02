import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Movie, Review } from './models.js';
import { movieStats, emptyStats, recommendations } from './recommend.js';
import { connectDB } from './db.js';
import { seedInitialData } from './seedData.js';

const app = express();
app.use(cors(), express.json());
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);
const sign = u => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });

const auth = (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Please log in' }); }
};
const admin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only' });

// ---- Auth ----
app.post('/api/auth/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || (password || '').length < 6) return res.status(400).json({ error: 'Name, email and a 6+ character password are required' });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user: pub(user) });
}));
app.post('/api/auth/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ error: 'Wrong email or password' });
  res.json({ token: sign(user), user: pub(user) });
}));

// ---- Movies: browse, search, filter, sort ----
app.get('/api/movies', wrap(async (req, res) => {
  const { q, genre, language, year, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (genre) filter.genres = genre;
  if (language) filter.languages = language;
  if (year) filter.year = +year;
  const movies = await Movie.find(filter).lean();
  const stats = await movieStats();
  let list = movies.map(m => ({ ...m, stats: stats.get(String(m._id)) || emptyStats }));
  const sorts = {
    newest: (a, b) => (b.year || 0) - (a.year || 0),
    rating: (a, b) => b.stats.avgRating - a.stats.avgRating,
    positive: (a, b) => b.stats.score - a.stats.score,
    title: (a, b) => a.title.localeCompare(b.title),
  };
  list.sort(sorts[sort] || sorts.newest);
  const total = list.length;
  list = list.slice((page - 1) * limit, page * limit);
  res.json({ movies: list, total, pages: Math.ceil(total / limit) });
}));
app.get('/api/genres', wrap(async (_, res) => res.json((await Movie.distinct('genres')).sort())));
app.get('/api/languages', wrap(async (_, res) => res.json((await Movie.distinct('languages')).sort())));

app.get('/api/movies/:id', wrap(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Movie not found' });
  const movie = await Movie.findById(req.params.id).lean();
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  const stats = (await movieStats({ movie: movie._id })).get(String(movie._id)) || emptyStats;
  const reviews = await Review.find({ movie: movie._id }).populate('user', 'name').sort('-createdAt').lean();
  res.json({ ...movie, stats, reviews });
}));

// ---- Reviews (one per user per movie; posting again updates it) ----
app.post('/api/movies/:id/reviews', auth, wrap(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Movie not found' });
  const rating = +req.body.rating;
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Rating must be 1 to 5' });
  const review = await Review.findOne({ movie: req.params.id, user: req.user.id }) || new Review({ movie: req.params.id, user: req.user.id });
  review.rating = rating; review.text = req.body.text || '';
  await review.save();
  res.status(201).json(review);
}));
app.delete('/api/reviews/:id', auth, wrap(async (req, res) => {
  const r = await Review.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Review not found' });
  if (String(r.user) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  await r.deleteOne(); res.json({ ok: true });
}));

// ---- Recommendations ----
app.get('/api/recommendations', wrap(async (req, res) => {
  res.json(await recommendations(+req.query.limit || 10, { genres: req.query.genre ? [req.query.genre] : undefined }));
}));
// Personalized: top movies in genres the user liked (4-5 stars), excluding ones already reviewed
app.get('/api/recommendations/me', auth, wrap(async (req, res) => {
  const mine = await Review.find({ user: req.user.id }).populate('movie', 'genres').lean();
  const liked = [...new Set(mine.filter(r => r.rating >= 4 && r.movie).flatMap(r => r.movie.genres))];
  res.json(await recommendations(10, { exclude: mine.map(r => r.movie?._id).filter(Boolean), genres: liked }));
}));

// ---- Admin ----
app.post('/api/admin/movies', auth, admin, wrap(async (req, res) => res.status(201).json(await Movie.create(req.body))));
app.put('/api/admin/movies/:id', auth, admin, wrap(async (req, res) => res.json(await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
app.delete('/api/admin/movies/:id', auth, admin, wrap(async (req, res) => {
  await Review.deleteMany({ movie: req.params.id }); await Movie.findByIdAndDelete(req.params.id); res.json({ ok: true });
}));
app.post('/api/admin/auto-fetch', auth, admin, wrap(async (_, res) => {
  await seedInitialData(true);
  res.json({ ok: true, message: 'All-languages original movies catalog re-synced successfully!' });
}));
app.get('/api/admin/reviews', auth, admin, wrap(async (_, res) =>
  res.json(await Review.find().populate('user', 'name email').populate('movie', 'title').sort('-createdAt').limit(200).lean())));
app.get('/api/admin/users', auth, admin, wrap(async (_, res) =>
  res.json(await User.find().select('-password').sort('-createdAt').lean())));

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: err.message }); });

await connectDB();
app.listen(process.env.PORT || 5000, () => console.log('API on port', process.env.PORT || 5000));
