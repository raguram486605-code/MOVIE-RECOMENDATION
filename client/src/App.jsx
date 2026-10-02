import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, getUser } from './api.js';

const Stars = ({ n }) => (
  <span className="stars" aria-label={`${n} of 5`}>
    {'★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))}
  </span>
);

function MovieLogo({ logoUrl, title, year, className = '' }) {
  const [err, setErr] = useState(false);
  if (logoUrl && !err) {
    return (
      <div className={`movie-logo-container ${className}`}>
        <img src={logoUrl} alt={`${title} Logo`} className="movie-logo-img" onError={() => setErr(true)} />
      </div>
    );
  }
  return (
    <div className={`movie-logo-badge ${className}`}>
      <span className="logo-badge-icon">🎬</span>
      <span className="logo-badge-title">{title}</span>
      <span className="logo-badge-tag">{year}</span>
    </div>
  );
}

function Poster({ src, title, altClass = '', year, genres }) {
  const [err, setErr] = useState(false);

  if (src && !err) {
    return (
      <div className={`poster ${altClass}`}>
        <img src={src} alt={title} onError={() => setErr(true)} loading="lazy" />
      </div>
    );
  }

  const firstLetter = title ? title[0].toUpperCase() : '🎬';
  const genreTag = genres && genres.length ? genres[0] : 'BLOCKBUSTER';

  return (
    <div className={`poster fallback-cinematic-poster ${altClass}`}>
      <div className="cinematic-poster-bg">
        <div className="poster-letter-hero">{firstLetter}</div>
        <div className="poster-gradient-overlay" />
        <div className="poster-content-box">
          <span className="poster-genre-chip">🎭 {genreTag}</span>
          <h4 className="poster-film-title">{title}</h4>
          {year && <span className="poster-year-badge">{year} OFFICIAL</span>}
        </div>
      </div>
    </div>
  );
}

// ---- Legitimate Authorized Streaming & Watch Modal ----
function WatchStreamModal({ movie, onClose }) {
  const sources = movie.streamingSources?.length ? movie.streamingSources : [
    { platform: 'Netflix', accessType: 'Stream (Subscription)', url: `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`, icon: '🔴' },
    { platform: 'Amazon Prime Video', accessType: 'Rent / Buy (4K)', url: `https://www.amazon.com/s?k=${encodeURIComponent(movie.title + ' movie')}`, icon: '📦' },
    { platform: 'Apple TV+', accessType: 'Rent ($3.99)', url: `https://tv.apple.com/search?term=${encodeURIComponent(movie.title)}`, icon: '🍏' },
    { platform: 'Google Play Movies', accessType: 'Rent ($3.99)', url: `https://play.google.com/store/search?q=${encodeURIComponent(movie.title)}&c=movies`, icon: '▶️' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <MovieLogo logoUrl={movie.logo} title={movie.title} year={movie.year} className="modal-logo" />
          <h2>▶️ Authorized Watch & Stream Options</h2>
          <p className="muted font-sm">Official Legitimate Distributors for <b>"{movie.title}"</b> ({movie.year})</p>
        </div>

        <div className="modal-body">
          <div className="legal-notice-banner">
            🛡️ <b>Legitimate Sources Only:</b> ReelRank directs you strictly to licensed streaming platforms, official distributors, and authorized digital stores. No pirated content.
          </div>

          <div className="streaming-providers-list">
            {sources.map(src => (
              <a
                key={src.platform}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="provider-card"
              >
                <div className="provider-icon">{src.icon}</div>
                <div className="provider-info">
                  <h4 className="provider-name">{src.platform}</h4>
                  <p className="provider-type">{src.accessType}</p>
                </div>
                <div className="provider-action">
                  <span>Watch Now ↗</span>
                </div>
              </a>
            ))}
          </div>

          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={onClose}>Close Window</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Movie Trailer Player Modal ----
function TrailerModal({ movie, onClose }) {
  const trailerUrl = movie.trailer || 'https://www.youtube.com/embed/YoHD9XEInc0';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container trailer-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>🎬 Official Trailer — {movie.title} ({movie.year})</h2>
        </div>

        <div className="modal-body">
          <div className="trailer-video-wrapper">
            <iframe
              src={trailerUrl}
              title={`${movie.title} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={onClose}>Close Trailer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Interactive Ticket Booking Modal ----
function TicketBookingModal({ movie, onClose }) {
  const theaters = movie.theaters?.length ? movie.theaters : [
    {
      id: 'th-1',
      name: 'PVR IMAX & Luxe Cinema',
      location: 'Forum Mall, Central Hub',
      screenTypes: ['IMAX 3D', 'Dolby Atmos 7.1'],
      showtimes: ['10:30 AM', '01:45 PM', '05:15 PM', '08:45 PM', '11:15 PM'],
      ticketPrice: 16
    },
    {
      id: 'th-2',
      name: 'INOX Megaplex 4DX',
      location: 'Downtown City Center',
      screenTypes: ['4DX Motion', 'DTS-X Audio'],
      showtimes: ['11:00 AM', '02:30 PM', '06:00 PM', '09:30 PM'],
      ticketPrice: 14
    },
    {
      id: 'th-3',
      name: 'Cinepolis VIP Recliner Lounge',
      location: 'Grand Galleria Promenade',
      screenTypes: ['VIP Recliner', 'Dolby Atmos'],
      showtimes: ['12:15 PM', '03:45 PM', '07:15 PM', '10:30 PM'],
      ticketPrice: 18
    }
  ];

  const [selectedTheater, setSelectedTheater] = useState(theaters[0]);
  const [selectedShowtime, setSelectedShowtime] = useState(theaters[0].showtimes[1] || '05:15 PM');
  const [selectedDate, setSelectedDate] = useState('Today (Oct 2)');
  const [selectedSeats, setSelectedSeats] = useState(['P5', 'P6']);
  const [isBooked, setIsBooked] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  const dates = ['Today (Oct 2)', 'Tomorrow (Oct 3)', 'Saturday (Oct 4)', 'Sunday (Oct 5)'];
  const rows = ['R', 'P', 'C'];
  const seatsPerRow = [1, 2, 3, 4, 5, 6, 7, 8];

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const confirmBooking = () => {
    if (!selectedSeats.length) return alert('Please select at least 1 seat!');
    const randomRef = 'RR-' + Math.floor(100000 + Math.random() * 900000);
    setTicketRef(randomRef);
    setIsBooked(true);
  };

  const totalPrice = selectedSeats.length * selectedTheater.ticketPrice;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container booking-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <MovieLogo logoUrl={movie.logo} title={movie.title} year={movie.year} className="modal-logo" />
          <h2>🎟️ Book Tickets for "{movie.title}"</h2>
          <p className="muted font-sm">Choose Theater · Select Seats · Instant Cinema Pass</p>
        </div>

        {!isBooked ? (
          <div className="modal-body booking-body">
            <div className="booking-section">
              <label className="section-label">1. Select Date:</label>
              <div className="date-chips">
                {dates.map(d => (
                  <button
                    key={d}
                    className={`date-chip ${selectedDate === d ? 'active' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    📅 {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-section">
              <label className="section-label">2. Select Theater & Showtime:</label>
              <div className="theaters-list">
                {theaters.map(t => (
                  <div
                    key={t.id}
                    className={`theater-card ${selectedTheater.id === t.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedTheater(t);
                      setSelectedShowtime(t.showtimes[0]);
                    }}
                  >
                    <div className="th-header">
                      <div>
                        <h4 className="th-name">🏛️ {t.name}</h4>
                        <p className="th-loc">📍 {t.location}</p>
                      </div>
                      <div className="th-price">${t.ticketPrice} / ticket</div>
                    </div>
                    <div className="th-screens">
                      {t.screenTypes?.map(st => <span key={st} className="screen-badge">{st}</span>)}
                    </div>
                    <div className="showtimes-row">
                      {t.showtimes.map(st => (
                        <button
                          key={st}
                          className={`showtime-btn ${selectedTheater.id === t.id && selectedShowtime === st ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTheater(t);
                            setSelectedShowtime(st);
                          }}
                        >
                          🕒 {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="booking-section">
              <label className="section-label">3. Select Seats ({selectedTheater.name} - {selectedShowtime}):</label>
              <div className="cinema-screen-wrap">
                <div className="screen-indicator">🎬 SCREEN THIS WAY 🎬</div>
              </div>

              <div className="seat-grid-container">
                {rows.map(row => (
                  <div key={row} className="seat-row">
                    <span className="row-label">{row === 'R' ? 'Recliner' : row === 'P' ? 'Prime' : 'Classic'}</span>
                    <div className="seats-list">
                      {seatsPerRow.map(num => {
                        const seatId = `${row}${num}`;
                        const isSelected = selectedSeats.includes(seatId);
                        const isOccupied = row === 'R' && num === 3;
                        return (
                          <button
                            key={seatId}
                            disabled={isOccupied}
                            className={`seat-btn ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                            onClick={() => toggleSeat(seatId)}
                            title={isOccupied ? 'Occupied' : `Seat ${seatId} ($${selectedTheater.ticketPrice})`}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="seat-legend">
                <span><i className="seat-sample available" /> Available</span>
                <span><i className="seat-sample selected" /> Selected</span>
                <span><i className="seat-sample occupied" /> Occupied</span>
              </div>
            </div>

            <div className="booking-footer-bar">
              <div className="summary-info">
                <div>Selected Seats: <b className="red-text">{selectedSeats.join(', ') || 'None'}</b></div>
                <div className="total-amount">Total: <b>${totalPrice}</b> <small>({selectedSeats.length} seats)</small></div>
              </div>
              <button
                className="btn-primary confirm-booking-btn red-glow-btn"
                disabled={!selectedSeats.length}
                onClick={confirmBooking}
              >
                🎟️ Confirm & Pay ${totalPrice}
              </button>
            </div>
          </div>
        ) : (
          <div className="ticket-success-wrapper">
            <div className="ticket-card">
              <div className="ticket-header-strip">
                <div className="t-logo">🎬 ReelRank Red Pass</div>
                <div className="t-ref">Ref: <b>{ticketRef}</b></div>
              </div>
              <div className="ticket-body">
                <MovieLogo logoUrl={movie.logo} title={movie.title} year={movie.year} className="ticket-movie-logo" />
                <h3 className="ticket-movie-title">{movie.title}</h3>
                <div className="ticket-details-grid">
                  <div><span>Theater:</span> <b>{selectedTheater.name}</b></div>
                  <div><span>Screen:</span> <b>{selectedTheater.screenTypes?.[0] || 'IMAX 3D'}</b></div>
                  <div><span>Date:</span> <b>{selectedDate}</b></div>
                  <div><span>Time:</span> <b>{selectedShowtime}</b></div>
                  <div><span>Seats:</span> <b className="red-text">{selectedSeats.join(', ')}</b></div>
                  <div><span>Total Paid:</span> <b>${totalPrice}</b></div>
                </div>
                <div className="ticket-qr-section">
                  <div className="mock-qr-code">
                    <div className="qr-box">██████████<br />██ 🎟️ 📱 ██<br />██████████</div>
                  </div>
                  <p className="qr-note">Scan this Red QR Code at the cinema entrance turnstile.</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-primary red-glow-btn" onClick={() => window.print()}>
                🖨️ Print / Save Ticket Pass
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Done & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ m, onWatchStream, onTrailer, onBookTicket }) {
  const s = m.stats || {};

  return (
    <div className="card black-red-card">
      <Link to={`/movie/${m._id}`} className="card-media-wrap">
        <Poster src={m.poster} title={m.title} year={m.year} genres={m.genres} />
        <MovieLogo logoUrl={m.logo} title={m.title} year={m.year} className="card-logo-overlay" />
      </Link>
      <div className="card-body">
        <Link to={`/movie/${m._id}`}>
          <h3 className="card-title">{m.title}</h3>
        </Link>
        <p className="muted card-meta">
          <span>{m.year}</span>
          {m.languages && m.languages.length > 0 && <span className="lang-tag">{m.languages.join(', ')}</span>}
        </p>
        <p className="genres-list">{m.genres?.join(' · ')}</p>

        {s.reviewCount > 0 ? (
          <div className="card-stats">
            <span className="pct-positive"><b>{s.positivePct}%</b> positive score</span>
            <span className="muted">({s.positive} pos / {s.negative} neg)</span>
          </div>
        ) : (
          <p className="muted font-sm">No reviews yet</p>
        )}

        <div className="card-action-bar triple-action-bar">
          <button className="card-btn watch-btn red-card-btn" onClick={() => onWatchStream(m)} title="Watch on Netflix, Prime Video, Apple TV">
            ▶️ Stream
          </button>
          <button className="card-btn trailer-btn" onClick={() => onTrailer(m)} title="Play YouTube Official Trailer">
            🎬 Trailer
          </button>
          <button className="card-btn ticket-btn" onClick={() => onBookTicket(m)} title="Book Theater Seats">
            🎟️ Tickets
          </button>
        </div>
      </div>
    </div>
  );
}

function Menubar({ genres, languages }) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const nav = useNavigate();
  const user = getUser();

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (query.trim()) {
      nav(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      nav('/');
    }
  };

  const logout = () => {
    localStorage.clear();
    location.href = '/';
  };

  const activeLang = searchParams.get('language') || '';
  const activeGenre = searchParams.get('genre') || '';

  return (
    <header className="menubar-header red-header">
      <div className="menubar-main">
        <Link to="/" className="logo red-logo">🎬 ReelRank</Link>

        <form onSubmit={handleSearchSubmit} className="quick-search-form">
          <input
            type="search"
            placeholder="🔍 Search movies by title, actor, genre..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="quick-search-input red-search"
          />
        </form>

        <nav className="menubar-nav">
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/?sort=positive" className="nav-link">🔥 Most Loved</Link>
          <Link to="/?sort=rating" className="nav-link">⭐ Top Rated</Link>
          {user?.role === 'admin' && <Link to="/admin" className="nav-link admin-link">⚙️ Admin</Link>}
          {user ? (
            <div className="user-menu">
              <span className="user-badge red-user-badge">👤 {user.name}</span>
              <button className="link logout-btn" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/register" className="nav-button red-nav-btn">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>

      <div className="quick-access-bar red-access-bar">
        <div className="quick-label">🌐 Languages:</div>
        <div className="quick-chips">
          <Link to="/" className={`chip ${!activeLang ? 'active' : ''}`}>All</Link>
          {languages.map(l => (
            <Link
              key={l}
              to={`/?language=${encodeURIComponent(l)}`}
              className={`chip ${activeLang === l ? 'active' : ''}`}
            >
              {l}
            </Link>
          ))}
        </div>

        <div className="quick-divider">|</div>

        <div className="quick-label">🎭 Genres:</div>
        <div className="quick-chips">
          <Link to="/" className={`chip ${!activeGenre ? 'active' : ''}`}>All</Link>
          {genres.map(g => (
            <Link
              key={g}
              to={`/?genre=${encodeURIComponent(g)}`}
              className={`chip ${activeGenre === g ? 'active' : ''}`}
            >
              {g}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const language = searchParams.get('language') || '';
  const sort = searchParams.get('sort') || 'positive';
  const page = +(searchParams.get('page') || 1);

  const [data, setData] = useState({ movies: [], pages: 1 });
  const [recs, setRecs] = useState([]);

  const [watchMovie, setWatchMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [ticketMovie, setTicketMovie] = useState(null);

  const user = getUser();

  useEffect(() => {
    api(user ? '/recommendations/me' : '/recommendations?limit=6')
      .then(r => (Array.isArray(r) && r.length ? setRecs(r) : api('/recommendations?limit=6').then(setRecs)))
      .catch(() => api('/recommendations?limit=6').then(setRecs).catch(() => {}));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (genre) params.set('genre', genre);
    if (language) params.set('language', language);
    if (sort) params.set('sort', sort);
    params.set('page', page);
    params.set('limit', 12);
    api('/movies?' + params.toString()).then(setData).catch(() => {});
  }, [q, genre, language, sort, page]);

  const updateParam = (k, v) => {
    const nextParams = new URLSearchParams(searchParams);
    if (v) {
      nextParams.set(k, v);
    } else {
      nextParams.delete(k);
    }
    if (k !== 'page') nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  return (
    <>
      {!q && !genre && !language && (
        <section className="section-hero">
          <h2 className="section-red-title">{user ? 'Recommended For You' : 'Top Loved Right Now'}</h2>
          <p className="muted">Ranked by real-time positive reviews (4–5 stars & positive sentiment), weighted by review volume.</p>
          <div className="grid">
            {recs.map(m => (
              <Card
                key={m._id}
                m={m}
                onWatchStream={setWatchMovie}
                onTrailer={setTrailerMovie}
                onBookTicket={setTicketMovie}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section-browse">
        <div className="browse-header">
          <h2>
            {q ? `Search results for "${q}"` : language ? `${language} Movies` : genre ? `${genre} Movies` : 'Browse Movies'}
          </h2>
          {(q || genre || language) && (
            <Link to="/" className="clear-filters-btn">✕ Clear Filters</Link>
          )}
        </div>

        <div className="filters">
          <input
            type="search"
            placeholder="🔍 Search movie title..."
            value={q}
            onChange={e => updateParam('q', e.target.value)}
          />
          <select value={sort} onChange={e => updateParam('sort', e.target.value)}>
            <option value="positive">Sort: Most Positive %</option>
            <option value="rating">Sort: Highest Star Rating</option>
            <option value="newest">Sort: Newest Release</option>
            <option value="title">Sort: A–Z</option>
          </select>
        </div>

        <div className="grid">
          {data.movies.map(m => (
            <Card
              key={m._id}
              m={m}
              onWatchStream={setWatchMovie}
              onTrailer={setTrailerMovie}
              onBookTicket={setTicketMovie}
            />
          ))}
        </div>

        {!data.movies.length && (
          <div className="empty-state">
            <p className="muted">No movies match your search query. Try searching for a different title or genre.</p>
          </div>
        )}

        <div className="pager">
          <button disabled={page <= 1} onClick={() => updateParam('page', page - 1)}>← Previous</button>
          <span>Page <b>{page}</b> of <b>{data.pages || 1}</b></span>
          <button disabled={page >= data.pages} onClick={() => updateParam('page', page + 1)}>Next →</button>
        </div>
      </section>

      {watchMovie && (
        <WatchStreamModal movie={watchMovie} onClose={() => setWatchMovie(null)} />
      )}
      {trailerMovie && (
        <TrailerModal movie={trailerMovie} onClose={() => setTrailerMovie(null)} />
      )}
      {ticketMovie && (
        <TicketBookingModal movie={ticketMovie} onClose={() => setTicketMovie(null)} />
      )}
    </>
  );
}

function MovieDetail() {
  const { id } = useParams();
  const [m, setM] = useState(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [watchMovie, setWatchMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [ticketMovie, setTicketMovie] = useState(null);

  const user = getUser();

  const load = () => api('/movies/' + id).then(setM).catch(() => {});
  useEffect(() => { load(); }, [id]);

  if (!m) return <div className="loading-spinner">Loading movie details...</div>;

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api(`/movies/${id}/reviews`, { method: 'POST', body: { rating, text } });
      setText('');
      load();
    } catch (x) {
      setErr(x.message);
    } finally {
      setLoading(false);
    }
  };

  const del = async rid => {
    if (confirm('Are you sure you want to delete this review?')) {
      await api('/reviews/' + rid, { method: 'DELETE' });
      load();
    }
  };

  const s = m.stats || {};
  const total = s.reviewCount || 0;

  const sources = m.streamingSources?.length ? m.streamingSources : [
    { platform: 'Netflix', accessType: 'Stream (Subscription)', url: `https://www.netflix.com/search?q=${encodeURIComponent(m.title)}`, icon: '🔴' },
    { platform: 'Amazon Prime Video', accessType: 'Rent / Buy (4K)', url: `https://www.amazon.com/s?k=${encodeURIComponent(m.title + ' movie')}`, icon: '📦' },
    { platform: 'Apple TV+', accessType: 'Rent ($3.99)', url: `https://tv.apple.com/search?term=${encodeURIComponent(m.title)}`, icon: '🍏' }
  ];

  const defaultTheaters = m.theaters?.length ? m.theaters : [
    { name: 'PVR IMAX & Luxe Cinema', location: 'Forum Mall', screenTypes: ['IMAX 3D'], showtimes: ['10:30 AM', '05:15 PM'], ticketPrice: 16 },
    { name: 'INOX Megaplex 4DX', location: 'Downtown', screenTypes: ['4DX Motion'], showtimes: ['02:30 PM', '09:30 PM'], ticketPrice: 14 }
  ];

  return (
    <div className="detail">
      <div className="detail-header-card">
        <Poster src={m.poster} title={m.title} year={m.year} genres={m.genres} altClass="big" />
        <div className="detail-content">
          <MovieLogo logoUrl={m.logo} title={m.title} year={m.year} className="detail-logo-banner" />
          <h1>{m.title} <small className="muted">({m.year})</small></h1>

          <div className="badge-row">
            {m.languages?.map(l => (
              <Link key={l} to={`/?language=${encodeURIComponent(l)}`} className="badge lang hover-badge">
                🌐 {l}
              </Link>
            ))}
            {m.genres?.map(g => (
              <Link key={g} to={`/?genre=${encodeURIComponent(g)}`} className="badge genre hover-badge">
                🎭 {g}
              </Link>
            ))}
          </div>

          <p className="director-cast">
            <strong>Director:</strong> {m.director || 'N/A'} <br />
            <strong>Cast:</strong> {m.cast?.join(', ') || 'N/A'}
          </p>

          <p className="description">{m.description}</p>

          {/* Action Buttons: Watch Stream & Play Trailer & Book Tickets */}
          <div className="detail-actions-row">
            <button className="btn-primary detail-download-btn red-glow-btn" onClick={() => setWatchMovie(m)}>
              ▶️ Watch / Stream Authorized
            </button>
            <button className="btn-secondary detail-trailer-btn" onClick={() => setTrailerMovie(m)}>
              🎬 Play YouTube Trailer
            </button>
            <button className="btn-secondary detail-ticket-btn" onClick={() => setTicketMovie(m)}>
              🎟️ Book Theater Seats
            </button>
          </div>

          {/* YouTube Trailer Embed Player */}
          {m.trailer && (
            <div className="detail-trailer-box">
              <h3>🎬 Official Movie Trailer</h3>
              <div className="trailer-video-wrapper">
                <iframe
                  src={m.trailer}
                  title={`${m.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Authorized Streaming Platforms Overview */}
          <div className="streaming-overview-panel">
            <h3>🛡️ Official Authorized Watch & Streaming Sources</h3>
            <div className="streaming-providers-list">
              {sources.map(src => (
                <a
                  key={src.platform}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="provider-card"
                >
                  <div className="provider-icon">{src.icon}</div>
                  <div className="provider-info">
                    <h4 className="provider-name">{src.platform}</h4>
                    <p className="provider-type">{src.accessType}</p>
                  </div>
                  <div className="provider-action">
                    <span>Watch Now ↗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Listed Theaters Section */}
          <div className="theaters-overview-panel">
            <h3>🏛️ Listed Theaters Showing "{m.title}"</h3>
            <div className="theaters-overview-grid">
              {defaultTheaters.map(th => (
                <div key={th.name} className="overview-th-card">
                  <div className="th-title-row">
                    <b>{th.name}</b>
                    <span className="screen-tag">{th.screenTypes?.[0] || 'IMAX'}</span>
                  </div>
                  <p className="muted font-sm">{th.location}</p>
                  <div className="th-showtimes-mini">
                    {th.showtimes?.map(st => <span key={st} className="mini-chip">{st}</span>)}
                  </div>
                  <button className="link book-direct-link" onClick={() => setTicketMovie(m)}>
                    Book Seats at {th.name} →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Sentiment & Review Metrics */}
          <div className="sentiment-panel">
            <h3>Real-time Sentiment Deduction & Rating Score</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <b className="rating-val">{s.avgRating || '0.0'}</b>
                <span>Average Rating <Stars n={s.avgRating || 0} /></span>
              </div>
              <div className="stat-card pos">
                <b className="pos-val">{s.positivePct || 0}%</b>
                <span>Positive ({s.positive || 0} of {total})</span>
              </div>
              <div className="stat-card neg">
                <b className="neg-val">{s.negativePct || 0}%</b>
                <span>Negative ({s.negative || 0} of {total})</span>
              </div>
              <div className="stat-card neu">
                <b>{s.neutral || 0}</b>
                <span>Neutral comments</span>
              </div>
            </div>

            <div className="sentiment-bars">
              <div className="bar-label">
                <span>Positive Comments ({s.positivePct || 0}%)</span>
                <span>{s.positive || 0}</span>
              </div>
              <div className="bar"><i className="bar-pos" style={{ width: (s.positivePct || 0) + '%' }} /></div>

              <div className="bar-label">
                <span>Negative Comments ({s.negativePct || 0}%)</span>
                <span>{s.negative || 0}</span>
              </div>
              <div className="bar"><i className="bar-neg" style={{ width: (s.negativePct || 0) + '%' }} /></div>
            </div>
          </div>

          {/* Post Review Form */}
          {user ? (
            <form onSubmit={submit} className="review-form">
              <h3>Post Your Real-Time Review</h3>
              <label>
                Your Star Rating:
                <select value={rating} onChange={e => setRating(+e.target.value)}>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars (Good)</option>
                  <option value={3}>⭐⭐⭐ 3 Stars (Average)</option>
                  <option value={2}>⭐⭐ 2 Stars (Poor)</option>
                  <option value={1}>⭐ 1 Star (Terrible)</option>
                </select>
              </label>
              <textarea
                rows="3"
                placeholder="Write your genuine review comments here... (e.g. 'Loved the acting and soundtrack', 'Boring storyline and poor script')"
                value={text}
                onChange={e => setText(e.target.value)}
                required
              />
              {err && <p className="error">{err}</p>}
              <button disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>💡 <Link to="/login">Log in</Link> or <Link to="/register">Sign up</Link> to post real-time reviews and deduct sentiment!</p>
            </div>
          )}

          <div className="reviews-section">
            <h3>Real-Time Community Reviews ({m.reviews?.length || 0})</h3>
            {m.reviews?.map(r => (
              <div key={r._id} className={`review-card ${r.sentiment}`}>
                <div className="review-header">
                  <div>
                    <strong>{r.user?.name || 'Anonymous User'}</strong>
                    <span className="stars-wrap"><Stars n={r.rating} /></span>
                  </div>
                  <span className={`sentiment-tag ${r.sentiment}`}>
                    {r.sentiment === 'positive' ? '👍 Positive' : r.sentiment === 'negative' ? '👎 Negative' : '😐 Neutral'}
                  </span>
                </div>
                <p className="review-text">{r.text || 'No written comment provided.'}</p>
                {user && (user.id === r.user?._id || user.role === 'admin') && (
                  <button className="link danger" onClick={() => del(r._id)}>Delete Review</button>
                )}
              </div>
            ))}
            {!m.reviews?.length && <p className="muted">No user reviews yet. Be the first to add one!</p>}
          </div>
        </div>
      </div>

      {watchMovie && (
        <WatchStreamModal movie={watchMovie} onClose={() => setWatchMovie(null)} />
      )}
      {trailerMovie && (
        <TrailerModal movie={trailerMovie} onClose={() => setTrailerMovie(null)} />
      )}
      {ticketMovie && (
        <TicketBookingModal movie={ticketMovie} onClose={() => setTicketMovie(null)} />
      )}
    </div>
  );
}

function Auth({ mode, onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' }), [err, setErr] = useState('');
  const nav = useNavigate();
  const submit = async e => {
    e.preventDefault();
    try {
      const r = await api(`/auth/${mode}`, { method: 'POST', body: form });
      localStorage.setItem('token', r.token);
      localStorage.setItem('user', JSON.stringify(r.user));
      onAuth();
      nav('/');
    } catch (x) {
      setErr(x.message);
    }
  };
  const bind = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });
  return (
    <form onSubmit={submit} className="auth">
      <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
      {mode === 'register' && <input placeholder="Your Name" required {...bind('name')} />}
      <input type="email" placeholder="Email Address" required {...bind('email')} />
      <input type="password" placeholder="Password (6+ characters)" required {...bind('password')} />
      {err && <p className="error">{err}</p>}
      <button className="red-glow-btn">{mode === 'login' ? 'Log In' : 'Sign Up'}</button>
    </form>
  );
}

function Admin() {
  const blank = { title: '', year: '', genres: '', languages: '', director: '', cast: '', poster: '', logo: '', trailer: '', description: '' };
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  const load = () => {
    api('/movies?limit=100&sort=title').then(d => setMovies(d.movies)).catch(() => {});
    api('/admin/reviews').then(setReviews).catch(() => {});
    api('/admin/users').then(setUsers).catch(() => {});
  };
  useEffect(load, []);

  const save = async e => {
    e.preventDefault();
    const genresArr = typeof form.genres === 'string' ? form.genres.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(form.genres) ? form.genres : []);
    const languagesArr = typeof form.languages === 'string' ? form.languages.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(form.languages) ? form.languages : []);
    const castArr = typeof form.cast === 'string' ? form.cast.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(form.cast) ? form.cast : []);
    const body = { ...form, year: +form.year || undefined, genres: genresArr, languages: languagesArr, cast: castArr };
    await api(editing ? `/admin/movies/${editing}` : '/admin/movies', { method: editing ? 'PUT' : 'POST', body });
    setForm(blank);
    setEditing(null);
    load();
  };

  const edit = m => {
    setEditing(m._id);
    setForm({
      ...m,
      genres: m.genres?.join(', ') || '',
      languages: m.languages?.join(', ') || '',
      cast: m.cast?.join(', ') || ''
    });
    window.scrollTo(0, 0);
  };

  const autoFetch = async () => {
    if (confirm('Re-sync full catalog with original TMDB movie posters & logos across all languages?')) {
      try {
        await api('/admin/auto-fetch', { method: 'POST' });
        alert('Original movie catalog re-synced successfully!');
        load();
      } catch (err) {
        alert(err.message || 'Auto-fetch failed');
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header-row">
        <h2>{editing ? 'Edit Movie' : 'Add New Movie'}</h2>
        <button onClick={autoFetch} type="button" className="auto-fetch-btn red-glow-btn">⚡ Auto-Fetch & Re-sync All-Languages Catalog</button>
      </div>
      <form onSubmit={save} className="admin-form">
        <input placeholder="Movie Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Release Year (e.g. 2024)" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
        <input placeholder="Poster Image URL" value={form.poster} onChange={e => setForm({ ...form, poster: e.target.value })} />
        <input placeholder="Logo Image URL" value={form.logo || ''} onChange={e => setForm({ ...form, logo: e.target.value })} />
        <input placeholder="YouTube Trailer Embed URL" value={form.trailer || ''} onChange={e => setForm({ ...form, trailer: e.target.value })} />
        <input placeholder="Languages (comma separated)" value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} />
        <input placeholder="Genres (comma separated)" value={form.genres} onChange={e => setForm({ ...form, genres: e.target.value })} />
        <input placeholder="Director" value={form.director} onChange={e => setForm({ ...form, director: e.target.value })} />
        <input placeholder="Cast (comma separated)" value={form.cast} onChange={e => setForm({ ...form, cast: e.target.value })} />
        <textarea placeholder="Description" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button className="red-glow-btn">{editing ? 'Save Changes' : 'Add Movie'}</button>
      </form>

      <h2>Registered Accounts Saved in MongoDB ({users.length})</h2>
      <div className="admin-list">
        {users.map(u => (
          <div className="row" key={u._id}>
            <span>
              <strong>👤 {u.name}</strong> ({u.email}) — <small className="badge lang">{u.role}</small>
            </span>
            <span className="muted font-sm">🔒 Passwords stored as encrypted bcrypt hashes in MongoDB</span>
          </div>
        ))}
      </div>

      <h2>Manage Movies ({movies.length})</h2>
      <div className="admin-list">
        {movies.map(m => (
          <div className="row" key={m._id}>
            <span><strong>{m.title}</strong> ({m.year}) — <small className="muted">{m.languages?.join(', ')}</small></span>
            <span>
              <button className="link" onClick={() => edit(m)}>Edit</button>
              <button className="link danger" onClick={async () => {
                if (confirm('Delete this movie and all its reviews?')) {
                  await api('/admin/movies/' + m._id, { method: 'DELETE' });
                  load();
                }
              }}>Delete</button>
            </span>
          </div>
        ))}
      </div>

      <h2>Recent Community Reviews</h2>
      <div className="admin-list">
        {reviews.map(r => (
          <div className="row" key={r._id}>
            <span>
              <b>{r.movie?.title || 'Unknown'}</b> · {r.user?.name} · {r.rating}★ ({r.sentiment}) · <i>"{r.text}"</i>
            </span>
            <button className="link danger" onClick={async () => {
              await api('/reviews/' + r._id, { method: 'DELETE' });
              load();
            }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [, force] = useState(0);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    api('/genres').then(setGenres).catch(() => {});
    api('/languages').then(setLanguages).catch(() => {});
  }, []);

  return (
    <>
      <Menubar genres={genres} languages={languages} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/login" element={<Auth mode="login" onAuth={() => force(n => n + 1)} />} />
          <Route path="/register" element={<Auth mode="register" onAuth={() => force(n => n + 1)} />} />
          <Route path="/admin" element={getUser()?.role === 'admin' ? <Admin /> : <p className="muted">Admins only.</p>} />
        </Routes>
      </main>
    </>
  );
}
