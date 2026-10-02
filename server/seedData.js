import bcrypt from 'bcryptjs';
import { User, Movie, Review } from './models.js';

export async function seedInitialData(force = false) {
  const movieCount = await Movie.countDocuments();
  if (movieCount > 0 && !force) {
    return;
  }

  if (force) {
    await Promise.all([User.deleteMany(), Movie.deleteMany(), Review.deleteMany()]);
  }

  const hash = await bcrypt.hash('password123', 10);
  await User.create({ name: 'Admin', email: 'admin@example.com', password: hash, role: 'admin' });
  const fans = await User.insertMany([
    { name: 'Alex Johnson', email: 'alex@example.com', password: hash },
    { name: 'Priya Sharma', email: 'priya@example.com', password: hash },
    { name: 'David Miller', email: 'david@example.com', password: hash },
    { name: 'Meera Nair', email: 'meera@example.com', password: hash },
    { name: 'Karthik Raja', email: 'karthik@example.com', password: hash },
    { name: 'Sophia Chen', email: 'sophia@example.com', password: hash },
    { name: 'Carlos Ramos', email: 'carlos@example.com', password: hash },
    { name: 'Aarav Kumar', email: 'aarav@example.com', password: hash },
  ]);

  const defaultTheaters = [
    {
      id: 'th-1',
      name: 'PVR IMAX & Luxe Cinema',
      location: 'Forum Mall, Central Hub',
      screenTypes: ['IMAX 3D', 'Dolby Atmos 7.1', 'Laser 4K'],
      showtimes: ['10:30 AM', '01:45 PM', '05:15 PM', '08:45 PM', '11:15 PM'],
      ticketPrice: 16
    },
    {
      id: 'th-2',
      name: 'INOX Megaplex 4DX',
      location: 'Downtown City Center',
      screenTypes: ['4DX Motion', 'DTS-X Audio', 'RealD 3D'],
      showtimes: ['11:00 AM', '02:30 PM', '06:00 PM', '09:30 PM'],
      ticketPrice: 14
    },
    {
      id: 'th-3',
      name: 'Cinepolis VIP Recliner Lounge',
      location: 'Grand Galleria Promenade',
      screenTypes: ['VIP Leather Recliner', 'Dolby Atmos'],
      showtimes: ['12:15 PM', '03:45 PM', '07:15 PM', '10:30 PM'],
      ticketPrice: 18
    },
    {
      id: 'th-4',
      name: 'AMC Star Multiplex',
      location: 'Suburban Tech Park',
      screenTypes: ['Standard 2D', '4K Digital Laser'],
      showtimes: ['09:45 AM', '01:15 PM', '04:45 PM', '08:15 PM'],
      ticketPrice: 12
    }
  ];

  const defaultDownloads = [
    { quality: '4K Ultra HD (2160p)', size: '6.8 GB', format: 'MKV (HEVC / Dolby Atmos)', downloadUrl: '#' },
    { quality: '1080p Full HD', size: '2.4 GB', format: 'MP4 (x264 / AAC 5.1)', downloadUrl: '#' },
    { quality: '720p HD Ready', size: '1.1 GB', format: 'MP4 (x264 / Stereo)', downloadUrl: '#' },
    { quality: '480p Mobile Edition', size: '480 MB', format: 'MP4 (Optimized Mobile)', downloadUrl: '#' }
  ];

  const movies = await Movie.insertMany([
    {
      title: 'Inception',
      year: 2010,
      genres: ['Sci-Fi', 'Thriller', 'Action'],
      languages: ['English', 'Japanese'],
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      logo: 'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/inception-movie-logo-black-transparent-nolan-cinematic-minimalist-canvas-print-art.jpg',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/YoHD9XEInc0',
      description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      streamingSources: [
        { platform: 'Netflix', accessType: 'Stream (Subscription)', url: 'https://www.netflix.com/search?q=Inception', icon: '🔴' },
        { platform: 'Amazon Prime Video', accessType: 'Rent / Buy (4K)', url: 'https://www.amazon.com/s?k=Inception+movie', icon: '📦' },
        { platform: 'Apple TV+', accessType: 'Buy ($3.99)', url: 'https://tv.apple.com/search?term=Inception', icon: '🍏' },
        { platform: 'Google Play Movies', accessType: 'Rent ($3.99)', url: 'https://play.google.com/store/search?q=Inception&c=movies', icon: '▶️' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'RRR',
      year: 2022,
      genres: ['Action', 'Drama', 'History'],
      languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam'],
      director: 'S.S. Rajamouli',
      cast: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt'],
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/RRR_Movie_Logo.png',
      backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/f_vbAtFSEc0',
      description: 'A fearless revolutionary and an officer in the British army cross paths in 1920s India, forging an unbreakable bond.',
      streamingSources: [
        { platform: 'Netflix', accessType: 'Stream (Hindi 4K)', url: 'https://www.netflix.com/title/81476994', icon: '🔴' },
        { platform: 'ZEE5', accessType: 'Stream (Telugu / Tamil / Original)', url: 'https://www.zee5.com/movies/details/rrr/0-0-1z5147571', icon: '⚡' },
        { platform: 'Disney+ Hotstar', accessType: 'Stream (South Languages)', url: 'https://www.hotstar.com/search?q=RRR', icon: '🌟' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'The Dark Knight',
      year: 2008,
      genres: ['Action', 'Crime', 'Drama'],
      languages: ['English'],
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/The_Dark_Knight_Logo.png',
      backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/EXeTwQWrcwY',
      description: 'Batman faces the chaotic villain Joker who unleashes anarchy upon Gotham City in a game of psychological warfare.',
      streamingSources: [
        { platform: 'HBO Max / Max', accessType: 'Stream (Subscription)', url: 'https://www.max.com/search?q=The+Dark+Knight', icon: '🟣' },
        { platform: 'Amazon Prime Video', accessType: 'Rent / Buy (4K)', url: 'https://www.amazon.com/s?k=The+Dark+Knight', icon: '📦' },
        { platform: 'Apple TV+', accessType: 'Rent ($3.99)', url: 'https://tv.apple.com/search?term=The+Dark+Knight', icon: '🍏' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Parasite',
      year: 2019,
      genres: ['Drama', 'Thriller', 'Comedy'],
      languages: ['Korean', 'English'],
      director: 'Bong Joon Ho',
      cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
      poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Parasite_logo.png',
      backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/5xH0HfJHsaY',
      description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      streamingSources: [
        { platform: 'Hulu', accessType: 'Stream (Subscription)', url: 'https://www.hulu.com/movie/parasite-2019', icon: '🟢' },
        { platform: 'Amazon Prime Video', accessType: 'Rent / Buy', url: 'https://www.amazon.com/s?k=Parasite+movie', icon: '📦' },
        { platform: 'Apple TV+', accessType: 'Buy ($3.99)', url: 'https://tv.apple.com/search?term=Parasite', icon: '🍏' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Interstellar',
      year: 2014,
      genres: ['Sci-Fi', 'Drama', 'Adventure'],
      languages: ['English'],
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
      poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Interstellar_movie_logo.png',
      backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/zSWdZVtXT7E',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
      streamingSources: [
        { platform: 'Paramount+', accessType: 'Stream (Subscription)', url: 'https://www.paramountplus.com/search/?q=Interstellar', icon: '🔵' },
        { platform: 'Amazon Prime Video', accessType: 'Rent / Buy (4K)', url: 'https://www.amazon.com/s?k=Interstellar', icon: '📦' },
        { platform: 'Apple TV+', accessType: 'Rent ($3.99)', url: 'https://tv.apple.com/search?term=Interstellar', icon: '🍏' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Dangal',
      year: 2016,
      genres: ['Drama', 'Biography', 'Sport'],
      languages: ['Hindi', 'Tamil', 'Telugu'],
      director: 'Nitesh Tiwari',
      cast: ['Aamir Khan', 'Sakshi Tanwar', 'Fatima Sana Shaikh'],
      poster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Dangal_movie_logo.png',
      backdrop: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/x_7YlGv9u1g',
      description: 'Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become world-class wrestlers despite societal pressure.',
      streamingSources: [
        { platform: 'Netflix', accessType: 'Stream (Full HD)', url: 'https://www.netflix.com/search?q=Dangal', icon: '🔴' },
        { platform: 'Apple TV+', accessType: 'Rent ($3.99)', url: 'https://tv.apple.com/search?term=Dangal', icon: '🍏' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Spirited Away',
      year: 2001,
      genres: ['Animation', 'Adventure', 'Fantasy'],
      languages: ['Japanese', 'English'],
      director: 'Hayao Miyazaki',
      cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Spirited_Away_logo.png',
      backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/ByXuk9QqQkk',
      description: 'A young girl enters a mysterious spirit realm ruled by gods, witches, and spirits where humans are turned into beasts.',
      streamingSources: [
        { platform: 'Max / HBO Max', accessType: 'Stream (Studio Ghibli Hub)', url: 'https://www.max.com/search?q=Spirited+Away', icon: '🟣' },
        { platform: 'Netflix', accessType: 'Stream (Global)', url: 'https://www.netflix.com/search?q=Spirited+Away', icon: '🔴' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Oppenheimer',
      year: 2023,
      genres: ['Biography', 'Drama', 'History'],
      languages: ['English'],
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
      poster: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Oppenheimer_movie_title_logo.png',
      backdrop: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/uYPbbksJxIg',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      streamingSources: [
        { platform: 'Peacock', accessType: 'Stream (Subscription)', url: 'https://www.peacocktv.com/search?q=Oppenheimer', icon: '🦚' },
        { platform: 'Amazon Prime Video', accessType: 'Rent / Buy (IMAX 4K)', url: 'https://www.amazon.com/s?k=Oppenheimer', icon: '📦' },
        { platform: 'Apple TV+', accessType: 'Buy ($5.99)', url: 'https://tv.apple.com/search?term=Oppenheimer', icon: '🍏' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Baahubali 2: The Conclusion',
      year: 2017,
      genres: ['Action', 'Fantasy', 'Adventure'],
      languages: ['Telugu', 'Tamil', 'Hindi', 'Malayalam'],
      director: 'S.S. Rajamouli',
      cast: ['Prabhas', 'Rana Daggubati', 'Anushka Shetty'],
      poster: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Baahubali_2_Logo.png',
      backdrop: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/qD-6d8Wo3do',
      description: 'Amarendra Baahubali, the heir apparent to Mahishmati Kingdom, faces betrayal and conspiracy.',
      streamingSources: [
        { platform: 'Netflix', type: 'Stream (Hindi 4K)', url: 'https://www.netflix.com/search?q=Baahubali+2', icon: '🔴' },
        { platform: 'Disney+ Hotstar', type: 'Stream (Telugu / Tamil)', url: 'https://www.hotstar.com/search?q=Baahubali+2', icon: '🌟' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'K.G.F: Chapter 2',
      year: 2022,
      genres: ['Action', 'Crime', 'Thriller'],
      languages: ['Kannada', 'Hindi', 'Telugu', 'Tamil', 'Malayalam'],
      director: 'Prashanth Neel',
      cast: ['Yash', 'Sanjay Dutt', 'Raveena Tandon'],
      poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/KGF_Chapter_2_logo.png',
      backdrop: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/JKa05nyUmuQ',
      description: 'In the blood-soaked Kolar Gold Fields, Rocky name strikes fear into his foes while his allies look up to him.',
      streamingSources: [
        { platform: 'Amazon Prime Video', type: 'Stream (Multi-Audio 4K)', url: 'https://www.amazon.com/s?k=KGF+Chapter+2', icon: '📦' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Leo',
      year: 2023,
      genres: ['Action', 'Crime', 'Thriller'],
      languages: ['Tamil', 'Telugu', 'Hindi', 'Malayalam'],
      director: 'Lokesh Kanagaraj',
      cast: ['Vijay', 'Sanjay Dutt', 'Trisha Krishnan'],
      poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Leo_2023_film_logo.png',
      backdrop: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/Po3jStA673E',
      description: 'A mild-mannered café owner becomes a local hero through an act of violence, triggering ghosts from his past.',
      streamingSources: [
        { platform: 'Netflix', type: 'Stream (Official Exclusive)', url: 'https://www.netflix.com/title/81639323', icon: '🔴' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Manjummel Boys',
      year: 2024,
      genres: ['Adventure', 'Drama', 'Thriller'],
      languages: ['Malayalam', 'Tamil', 'Telugu'],
      director: 'Chidambaram',
      cast: ['Soubin Shahir', 'Sreenath Bhasi', 'Balu Varghese'],
      poster: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Manjummel_Boys_Title_Card.png',
      backdrop: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/5T2V0oZ1dBE',
      description: 'A group of friends from a small town go on a trip to Kodaikanal and face an unexpected crisis at Guna Caves.',
      streamingSources: [
        { platform: 'Disney+ Hotstar', type: 'Stream (Official Digital Partner)', url: 'https://www.hotstar.com/search?q=Manjummel+Boys', icon: '🌟' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    },
    {
      title: 'Spider-Man: Into the Spider-Verse',
      year: 2018,
      genres: ['Animation', 'Action', 'Adventure'],
      languages: ['English'],
      director: 'Bob Persichetti',
      cast: ['Shameik Moore', 'Jake Johnson', 'Hailee Steinfeld'],
      poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Spider-Man_Into_the_Spider-Verse_logo.png',
      backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
      trailer: 'https://www.youtube.com/embed/g4Hbz2jLxvQ',
      description: 'Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions.',
      streamingSources: [
        { platform: 'Netflix', type: 'Stream (Subscription)', url: 'https://www.netflix.com/search?q=Spider-Verse', icon: '🔴' },
        { platform: 'Disney+', type: 'Stream (Marvel Hub)', url: 'https://www.disneyplus.com/search?q=Spider-Verse', icon: '✨' },
        { platform: 'Apple TV+', type: 'Rent ($3.99)', url: 'https://tv.apple.com/search?term=Spider-Verse', icon: '🍏' }
      ],
      theaters: defaultTheaters,
      downloadOptions: defaultDownloads
    }
  ]);

  const reviewTemplates = [
    // Inception
    [
      { rating: 5, text: 'Mind-blowing masterpiece! The visuals and soundtrack are legendary.' },
      { rating: 5, text: 'Christopher Nolan at his absolute best. Loved every single scene.' },
      { rating: 4, text: 'Great action and fascinating story concept. Highly recommended!' },
      { rating: 5, text: 'An incredible epic cinematic experience. Super brilliant!' },
      { rating: 4, text: 'Very good movie with amazing dream mechanics.' },
      { rating: 3, text: 'It was decent, but a bit confusing on first watch.' },
      { rating: 5, text: 'Awesome storytelling and unbelievable performance by DiCaprio!' },
      { rating: 4, text: 'Solid sci-fi thriller. Enjoyed it a lot.' }
    ],
    // RRR
    [
      { rating: 5, text: 'Epic Indian action cinema at its absolute finest! Unbelievable energy!' },
      { rating: 5, text: 'Fantastic dance sequences and emotional friendship story. Masterpiece!' },
      { rating: 5, text: 'Mind-blowing action scenes and stunning visual effects.' },
      { rating: 4, text: 'Great music score and awesome lead performances.' },
      { rating: 5, text: 'Loved the Naatu Naatu dance and high-octane battle sequences!' },
      { rating: 4, text: 'Super entertaining from start to finish.' },
      { rating: 3, text: 'Good spectacle though a bit long in runtime.' },
      { rating: 5, text: 'Pure cinematic joy and brilliant action sequences.' }
    ],
    // The Dark Knight
    [
      { rating: 5, text: 'Heath Ledger performance as the Joker is the greatest in superhero history!' },
      { rating: 5, text: 'Absolute classic masterpiece. 10/10 perfect movie.' },
      { rating: 5, text: 'Super intense, dark, and brilliant storytelling.' },
      { rating: 4, text: 'Awesome crime thriller disguised as a Batman film.' },
      { rating: 5, text: 'Unforgettable dialogue and phenomenal direction.' },
      { rating: 2, text: 'Boring in parts and felt overly dark and depressing.' },
      { rating: 5, text: 'Mind-blowing movie, best comic book movie ever made!' },
      { rating: 4, text: 'Great action and moral depth.' }
    ],
    // Parasite
    [
      { rating: 5, text: 'Brilliant Oscar-winning masterpiece. Social commentary is razor sharp!' },
      { rating: 5, text: 'Stunning twist! Unbelievable direction by Bong Joon Ho.' },
      { rating: 4, text: 'Very captivating and smart black comedy thriller.' },
      { rating: 5, text: 'Loved the pacing, camera work, and tension building.' },
      { rating: 4, text: 'Great plot twist and superb performances.' },
      { rating: 3, text: 'Interesting story concept but a bit weird towards the end.' },
      { rating: 5, text: 'Top tier film making! Truly deserving of all awards.' },
      { rating: 4, text: 'Mind-blowing climax and excellent script.' }
    ],
    // Interstellar
    [
      { rating: 5, text: 'Hans Zimmer score paired with space exploration made me cry. Phenomenal!' },
      { rating: 5, text: 'Emotional and scientifically fascinating. Truly epic masterpiece.' },
      { rating: 3, text: 'Visually stunning, but the ending felt a bit forced.' },
      { rating: 5, text: 'Mind-blowing black hole visuals and deep emotional core.' },
      { rating: 4, text: 'Great adventure through time and space.' },
      { rating: 4, text: 'Loved the wormhole sequence and TARS robot character!' },
      { rating: 2, text: 'Too long and boring science dialogue in the middle.' },
      { rating: 5, text: 'Awesome space movie, unforgettable journey.' }
    ],
    // Dangal
    [
      { rating: 5, text: 'Inspirational true story! Aamir Khan gives a legendary performance.' },
      { rating: 5, text: 'Emotional sports drama with incredible wrestling sequences. Loved it!' },
      { rating: 4, text: 'Great story of determination, empowerment, and family.' },
      { rating: 5, text: 'Super motivational movie with brilliant music score.' },
      { rating: 4, text: 'Fantastic wrestling matches and great humor.' },
      { rating: 5, text: 'Mind-blowing performances by the young actresses.' },
      { rating: 3, text: 'Good sports movie, slightly predictable story beats.' },
      { rating: 4, text: 'Very touching and uplifting film experience.' }
    ],
    // Spirited Away
    [
      { rating: 5, text: 'Magical Studio Ghibli masterpiece. Beautiful animation art!' },
      { rating: 5, text: 'Wholesome, enchanting, and unforgettable world building.' },
      { rating: 4, text: 'Lovely anime classic with rich atmosphere.' },
      { rating: 5, text: 'Loved No-Face and Chihiro journey. Truly mesmerizing!' },
      { rating: 4, text: 'Great soundtrack and stunning visual imagination.' },
      { rating: 5, text: 'Super nostalgic and wonderful movie experience.' },
      { rating: 3, text: 'Decent animation story, a bit strange spirits.' },
      { rating: 4, text: 'Awesome fantasy world and sweet character arc.' }
    ],
    // Oppenheimer
    [
      { rating: 5, text: 'Colossal achievement in cinema history. Cillian Murphy is phenomenal!' },
      { rating: 5, text: 'Masterpiece sound design and unbelievable tension.' },
      { rating: 5, text: 'Best movie of 2023! Epic historical drama.' },
      { rating: 4, text: 'Brilliant editing and powerful score.' },
      { rating: 5, text: 'Unbelievable acting by Robert Downey Jr. and Murphy.' },
      { rating: 4, text: 'Intense courtroom and scientific drama.' },
      { rating: 5, text: 'Mind-blowing Trinity test sequence!' },
      { rating: 4, text: 'Superb storytelling from Nolan.' }
    ],
    // Baahubali 2
    [
      { rating: 5, text: 'Grandest Indian movie experience ever made! Visual masterpiece.' },
      { rating: 5, text: 'Phenomenal story resolution, Prabhas is epic as Baahubali.' },
      { rating: 4, text: 'Awesome action choreography and grand kingdom sets.' },
      { rating: 5, text: 'Loved the emotional confrontation and battle scenes!' },
      { rating: 5, text: 'Unbelievable background music score and climax.' },
      { rating: 4, text: 'Super high energy fantasy action.' },
      { rating: 3, text: 'Great visual spectacle though slightly long.' },
      { rating: 5, text: 'Pure epic blockbuster entertainment!' }
    ],
    // K.G.F Chapter 2
    [
      { rating: 5, text: 'Monster hit! Yash screen presence and heroism is legendary!' },
      { rating: 5, text: 'Insane mass elevations and action sequences.' },
      { rating: 4, text: 'High octane thriller with non-stop adrenaline.' },
      { rating: 5, text: 'Loved the dialogue delivery and BGM music score.' },
      { rating: 4, text: 'Awesome action set pieces and climax.' },
      { rating: 3, text: 'Super fast-paced editing and loud score.' },
      { rating: 5, text: 'Mind-blowing theater experience!' },
      { rating: 4, text: 'Great sequel to Chapter 1.' }
    ],
    // Leo
    [
      { rating: 5, text: 'Thalapathy Vijay and Lokesh Kanagaraj delivered a bloody sweet action movie!' },
      { rating: 5, text: 'Hyena fight sequence and cafe battle are mind-blowing!' },
      { rating: 4, text: 'Anirudh BGM music score is fire! Loved it.' },
      { rating: 5, text: 'Super intense performance by Vijay sir.' },
      { rating: 4, text: 'Great LCU connection and action design.' },
      { rating: 3, text: 'First half was peak, second half was good.' },
      { rating: 5, text: 'Awesome action thriller film!' },
      { rating: 4, text: 'Loved the transformation scenes.' }
    ],
    // Manjummel Boys
    [
      { rating: 5, text: 'Heart-stopping survival thriller! Real friendship masterpiece.' },
      { rating: 5, text: 'Kanmani Anbodu song scene gave goosebumps everywhere!' },
      { rating: 5, text: 'Unbelievable tension, true story executed brilliantly.' },
      { rating: 4, text: 'Great cinematography and authentic performances.' },
      { rating: 5, text: 'Loved the emotional friendship core.' },
      { rating: 4, text: 'Super well made Malayalam cinema!' },
      { rating: 5, text: 'Best survival movie in years!' },
      { rating: 4, text: 'Highly engaging and emotional journey.' }
    ],
    // Spider-Man Into the Spider-Verse
    [
      { rating: 5, text: 'Best Spider-Man movie ever! Revolutionary comic book animation style!' },
      { rating: 5, text: 'What’s Up Danger jump sequence is pure perfection!' },
      { rating: 4, text: 'Awesome soundtrack and hilarious spider-heroes.' },
      { rating: 5, text: 'Loved Miles Morales character development and art.' },
      { rating: 5, text: 'Visually groundbreaking masterpiece!' },
      { rating: 4, text: 'Super fun for all ages.' },
      { rating: 4, text: 'Great villain design and voice acting.' },
      { rating: 5, text: '10/10 animated superhero film.' }
    ]
  ];

  for (const [i, m] of movies.entries()) {
    for (const [j, u] of fans.entries()) {
      const rev = reviewTemplates[i][j];
      await Review.create({
        movie: m._id,
        user: u._id,
        rating: rev.rating,
        text: rev.text,
      });
    }
  }

  console.log('Seeded database with posters, multi-language support, and real-time reviews.');
}
