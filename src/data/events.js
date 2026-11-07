import { startsAt } from '../lib/schedule.js';

export const CATEGORIES = ['Music', 'Culture', 'Food', 'Tech', 'Sports', 'Workshops'];

/*
 * Event listings are fictional; venues are real public places.
 * `day` + `time` schedule each event relative to today in IST (see lib/schedule.js).
 * `board` is the short name shown on the departure board (max 19 characters).
 * `taken` is how many seats were already booked before this browser's own bookings.
 */
const RAW = [
  {
    id: 'odissi-under-the-stars',
    title: 'Odissi Under the Stars',
    board: 'ODISSI UNDER STARS',
    category: 'Culture',
    city: 'Bhubaneswar',
    venue: 'Ekamra Haat open-air stage',
    day: 5, time: '18:30', duration: 150,
    price: 299, capacity: 600, taken: 418,
    featured: true,
    organiser: 'Kalinga Dance Circle',
    blurb: 'Three Odissi ensembles perform under the open sky, with live mardala and flute.',
    about: [
      'Odissi is one of the oldest classical dance forms in India, and Bhubaneswar is where it lives. This evening brings three ensembles to the open-air stage at Ekamra Haat: a gurukul of young dancers, a solo abhinaya piece, and a closing group performance set to live mardala, flute and violin.',
      'Each piece is introduced in English and Odia, so you can follow the story even if it is your first time watching classical dance. Mats are laid out in front of the stage and chairs at the back.',
    ],
    highlights: ['Live musicians on mardala, flute and violin', 'Short introductions before every piece', 'Food stalls from local SHGs open from 5:30 pm', 'Wheelchair-accessible seating at the back'],
    tags: 'dance classical odisha odia',
  },
  {
    id: 'sitar-after-dark',
    title: 'Sitar After Dark',
    board: 'SITAR AFTER DARK',
    category: 'Music',
    city: 'Bhubaneswar',
    venue: 'Rabindra Mandap',
    day: 2, time: '19:30', duration: 120,
    price: 499, capacity: 420, taken: 296,
    organiser: 'Kalinga Sound Collective',
    blurb: 'A sitar and tabla duet that drifts into ambient electronics after the interval.',
    about: [
      'The first half is a traditional raga recital on sitar and tabla. After a twenty-minute chai interval, the same musicians come back with a synthesiser and loop pedals and rebuild the raga as a slow ambient set.',
      'It is a concert for people who love classical music and for people who have never sat through one. Phones on silent, please; the quiet passages are the best part.',
    ],
    highlights: ['Two sets with a 20-minute chai interval', 'Floor cushions in front, chairs behind', 'Doors open at 7:00 pm', 'Recommended for ages 10 and up'],
    tags: 'classical raga tabla electronic concert',
  },
  {
    id: 'pitch-night',
    title: 'Startup Pitch Night',
    board: 'PITCH NIGHT',
    category: 'Tech',
    city: 'Bhubaneswar',
    venue: 'Infocity, Patia',
    day: 4, time: '18:00', duration: 150,
    price: 0, capacity: 200, taken: 77,
    organiser: 'Odisha Founders Meetup',
    blurb: 'Eight student founders, five minutes each, and a panel that asks the hard questions.',
    about: [
      'Eight early-stage teams from colleges across Odisha pitch their products in five minutes each, followed by three minutes of questions from a panel of founders and angel investors.',
      'The audience votes for its favourite team, and the winner gets mentoring sessions and cloud credits. Stay back afterwards for open networking over samosas.',
    ],
    highlights: ['8 teams, 5-minute pitches', 'Audience vote for the crowd favourite', 'Open networking after the pitches', 'Free entry, registration required'],
    tags: 'startup founders investors entrepreneurship college',
  },
  {
    id: 'night-sky-camp',
    title: 'Night Sky Camp',
    board: 'NIGHT SKY CAMP',
    category: 'Workshops',
    city: 'Bhubaneswar',
    venue: 'Pathani Samanta Planetarium',
    day: 3, time: '20:00', duration: 180,
    price: 199, capacity: 120, taken: 120,
    organiser: 'Sky Watchers Odisha',
    blurb: 'Learn to find planets and constellations, then look through real telescopes.',
    about: [
      'Start inside the dome with a 40-minute show on how to read the night sky. Then head out to the lawns, where volunteers have set up six telescopes pointed at the Moon, Jupiter and Saturn.',
      'You will leave knowing how to spot at least five constellations with your own eyes, plus the free apps that help you find more.',
    ],
    highlights: ['40-minute dome show', 'Six telescopes on the lawns', 'Star map to take home', 'Good for families and kids over 8'],
    tags: 'astronomy stars planets telescope science kids',
  },
  {
    id: 'paint-a-pattachitra',
    title: 'Paint a Pattachitra',
    board: 'PAINT PATTACHITRA',
    category: 'Workshops',
    city: 'Puri',
    venue: 'Raghurajpur heritage crafts village',
    day: 9, time: '10:00', duration: 360,
    price: 1100, capacity: 30, taken: 25,
    organiser: 'Raghurajpur Chitrakar Guild',
    blurb: 'Spend a day with a chitrakar family and paint your own palm-leaf Pattachitra.',
    about: [
      'Raghurajpur, near Puri, is a village where almost every house is an artist\'s studio. A chitrakar family hosts this workshop in their home and teaches the basics of Pattachitra: preparing the cloth, mixing natural colours, and drawing the fine borders the style is known for.',
      'By the end of the day you will have a small painting of your own to take home. Lunch is a home-cooked Odia thali.',
    ],
    highlights: ['All materials and natural colours provided', 'Home-cooked Odia lunch included', 'Take your painting home', 'Pickup point at Puri bus stand at 9:15 am'],
    tags: 'painting art craft odisha heritage puri',
  },
  {
    id: 'old-delhi-food-walk',
    title: 'Parathas to Jalebis: Old Delhi Food Walk',
    board: 'OLD DELHI FOOD WALK',
    category: 'Food',
    city: 'Delhi',
    venue: 'Chandni Chowk (meet at Gate 1, Jama Masjid)',
    day: 4, time: '08:00', duration: 180,
    price: 899, capacity: 25, taken: 12,
    organiser: 'Purani Dilli Walks',
    blurb: 'Seven stops through the lanes of Chandni Chowk, from breakfast parathas to hot jalebis.',
    about: [
      'Walk through the narrow lanes of Old Delhi with a guide who grew up there. Seven tasting stops cover the classics: stuffed parathas, nagori halwa, daulat ki chaat, kulfi and jalebis straight out of the kadhai.',
      'Portions are small so you can try everything. Tell us about allergies when you register and the guide will plan around them.',
    ],
    highlights: ['7 tasting stops, all food included', 'Vegetarian-friendly route', 'Small group of 25 or fewer', 'Wear comfortable shoes; it is about 2.5 km'],
    tags: 'street food walk delhi chaat paratha vegetarian',
  },
  {
    id: 'hostel-stories',
    title: 'Hostel Stories: Stand-up Night',
    board: 'HOSTEL STORIES',
    category: 'Culture',
    city: 'Delhi',
    venue: 'Hauz Khas Village',
    day: 1, time: '21:00', duration: 90,
    price: 399, capacity: 150, taken: 96,
    organiser: 'Open Mic Delhi',
    blurb: 'Five comics, one theme: everything that ever went wrong in a college hostel.',
    about: [
      'Mess food, warden rounds, the one roommate who never sleeps. Five comedians from Delhi\'s open-mic circuit each do a 15-minute set about hostel life, in Hindi and English.',
      'The show is 18+ and contains strong language. Seating is first come, first served, so arrive early for the front rows.',
    ],
    highlights: ['5 comics, 15 minutes each', 'Hindi and English sets', '18+ only, ID checked at entry', 'Food and drinks available at the venue'],
    tags: 'comedy standup hindi college',
  },
  {
    id: 'block-printing-day',
    title: 'Block Printing in a Day',
    board: 'BLOCK PRINT DAY',
    category: 'Workshops',
    city: 'Jaipur',
    venue: 'Artisan studio, Bagru',
    day: 12, time: '11:00', duration: 300,
    price: 1200, capacity: 20, taken: 9,
    organiser: 'Bagru Chhipa Collective',
    blurb: 'Learn Bagru block printing with natural dyes from a master printer, and leave with your own dupatta.',
    about: [
      'Bagru, 30 km from Jaipur, has been home to the Chhipa community of block printers for centuries. In this workshop a master printer shows you how the wooden blocks are inked, aligned and pressed, and how the natural indigo and pomegranate dyes are made.',
      'You will print a full cotton dupatta of your own design, which is washed and fixed before you leave.',
    ],
    highlights: ['Print your own cotton dupatta', 'Natural dyes demonstration', 'Chai and Rajasthani snacks', 'Cab-share from Jaipur city available'],
    tags: 'craft textile rajasthan art printing',
  },
  {
    id: 'marine-drive-10k',
    title: 'Marine Drive Midnight 10K',
    board: 'MIDNIGHT 10K',
    category: 'Sports',
    city: 'Mumbai',
    venue: 'Marine Drive (start near NCPA)',
    day: 6, time: '23:30', duration: 120,
    price: 650, capacity: 2000, taken: 1640,
    organiser: 'Mumbai Night Runners',
    blurb: 'Run the Queen\'s Necklace after dark. Hydration every 2 km, vada pav at the finish.',
    about: [
      'The roads are quiet, the sea breeze is cool and the lights of the Queen\'s Necklace are on. This timed 10K runs the length of Marine Drive and back, with a 5K option for first-timers.',
      'Every finisher gets a medal and a vada pav. Bib collection opens two hours before the start at the NCPA end.',
    ],
    highlights: ['10K timed run with a 5K option', 'Hydration stations every 2 km', 'Finisher medal and vada pav', 'Bag drop at the start line'],
    tags: 'running marathon fitness night run',
  },
  {
    id: 'lo-fi-rooftop',
    title: 'Lo-fi on the Rooftop',
    board: 'LO-FI ROOFTOP',
    category: 'Music',
    city: 'Mumbai',
    venue: 'Rooftop in Bandra West (exact address on your pass)',
    day: 2, time: '20:00', duration: 180,
    price: 799, capacity: 180, taken: 141,
    organiser: 'Slow Beats Club',
    blurb: 'Three independent producers play slow, warm beats as the city lights come on.',
    about: [
      'Three independent producers from Mumbai\'s bedroom-music scene play back-to-back sets of lo-fi, jazz-hop and Bollywood flips. Bring a friend, grab a bean bag and watch the sea link light up.',
      'The exact rooftop address is shared on your pass on the day of the event.',
    ],
    highlights: ['3 live producer sets', 'Bean bag seating', 'One welcome drink included', 'Address shared on the day'],
    tags: 'lofi beats indie electronic bollywood',
  },
  {
    id: 'build-weekend',
    title: 'Build Weekend: 36-hour Hackathon',
    board: 'BUILD WEEKEND',
    category: 'Tech',
    city: 'Bengaluru',
    venue: 'Koramangala 5th Block',
    day: 10, time: '09:00', duration: 2160,
    price: 0, capacity: 300, taken: 188,
    organiser: 'Builders of Bengaluru',
    blurb: 'Teams of up to four build something useful for Indian cities in 36 hours.',
    about: [
      'The theme is "everyday India": build something that makes commuting, paying, learning or finding help easier for people in Indian cities. Teams of up to four, any stack, and mentors on call all weekend.',
      'Meals, snacks and a quiet sleeping room are provided. Prizes total ₹3 lakh across three tracks.',
    ],
    highlights: ['Teams of 1 to 4', '₹3 lakh in prizes across 3 tracks', 'All meals provided', 'Mentors from product companies'],
    tags: 'hackathon coding developers programming ai',
  },
  {
    id: 'college-street-adda',
    title: 'Adda on College Street',
    board: 'COLLEGE ST ADDA',
    category: 'Culture',
    city: 'Kolkata',
    venue: 'College Street book market',
    day: 7, time: '17:00', duration: 120,
    price: 0, capacity: 60, taken: 31,
    organiser: 'Boi Para Readers',
    blurb: 'A book swap and poetry adda in the lanes of Asia\'s largest second-hand book market.',
    about: [
      'Bring one book, take one home. The swap runs for the first hour among the stalls of Boi Para, then everyone settles in for an open adda where anyone can read a poem or a page they love, in Bangla, Hindi or English.',
      'Kolkata invented the adda, so expect long conversations and plenty of chai.',
    ],
    highlights: ['Bring a book, take a book', 'Open readings in any language', 'Short walking tour of the oldest stalls', 'Free entry'],
    tags: 'books poetry reading bengali kolkata literature',
  },
  {
    id: 'biryani-trail',
    title: 'Hyderabad Biryani Trail',
    board: 'BIRYANI TRAIL',
    category: 'Food',
    city: 'Hyderabad',
    venue: 'Old City (meet near Charminar)',
    day: 8, time: '12:30', duration: 180,
    price: 999, capacity: 30, taken: 22,
    organiser: 'Deccan Food Walks',
    blurb: 'Four biryani kitchens, one irani chai stop, and a vote for the city\'s best.',
    about: [
      'Hyderabad takes its biryani seriously. This trail visits four kitchens in the Old City, each with its own take on kacchi dum biryani, and ends with Irani chai and Osmania biscuits.',
      'At the end you vote for your favourite. Vegetarian guests get a separate tasting of veg dum biryani and mirchi ka salan.',
    ],
    highlights: ['4 biryani tastings', 'Irani chai and Osmania biscuits', 'Vegetarian tasting available', 'Walk of about 2 km'],
    tags: 'biryani food walk hyderabad nonveg',
  },
  {
    id: 'carnatic-at-dawn',
    title: 'Carnatic at Dawn',
    board: 'CARNATIC AT DAWN',
    category: 'Music',
    city: 'Chennai',
    venue: 'Mylapore, by the Kapaleeshwarar temple tank',
    day: 14, time: '06:00', duration: 120,
    price: 0, capacity: 250, taken: 90,
    organiser: 'Mylapore Rasikas',
    blurb: 'A sunrise kutcheri on the steps of the temple tank, with filter coffee for everyone.',
    about: [
      'In the music season, Chennai wakes up to Carnatic music. This free morning kutcheri features a young vocalist with violin and mridangam accompaniment, performed on the steps of the Mylapore temple tank as the sun comes up.',
      'Filter coffee is served at the end. Sit on the steps or bring a mat.',
    ],
    highlights: ['Vocal, violin and mridangam', 'Starts at sunrise', 'Filter coffee for everyone', 'Free entry, registration required'],
    tags: 'carnatic classical vocal chennai music season',
  },
  {
    id: 'sunset-surf-clinic',
    title: 'Sunset Surf Clinic',
    board: 'SUNSET SURF CLINIC',
    category: 'Sports',
    city: 'Goa',
    venue: 'Ashwem Beach, North Goa',
    day: 11, time: '16:00', duration: 150,
    price: 1500, capacity: 16, taken: 13,
    organiser: 'North Goa Surf School',
    blurb: 'A beginner surf lesson with certified coaches, ending with a beach bonfire.',
    about: [
      'Never surfed before? This clinic starts on the sand with balance and paddling drills, then moves into the gentle evening waves at Ashwem with one coach for every four surfers.',
      'Boards, rash guards and a lifeguard are included. You need to be able to swim. The evening ends with a small bonfire as the sun sets.',
    ],
    highlights: ['1 coach for every 4 surfers', 'Board and rash guard included', 'Lifeguard on duty', 'You must be able to swim'],
    tags: 'surfing beach water sports goa beginner',
  },
  {
    id: 'gully-cricket-league',
    title: 'Gully Cricket Night League',
    board: 'GULLY CRICKET',
    category: 'Sports',
    city: 'Pune',
    venue: 'Box turf, Baner',
    day: 13, time: '19:00', duration: 240,
    price: 300, capacity: 96, taken: 60,
    organiser: 'Baner Box Cricket',
    blurb: 'Six-a-side, six overs, tennis ball. Register solo and we will put you in a team.',
    about: [
      'The gully rules you grew up with, under floodlights: six players a side, six overs an innings, tennis ball, and one-tip-one-hand catches allowed. Sign up solo or as a group and we will make the teams.',
      'Top two teams play a final at the end of the night. Every player gets a jersey to keep.',
    ],
    highlights: ['6-a-side, 6 overs per innings', 'Solo sign-ups welcome', 'Jersey for every player', 'Final under floodlights'],
    tags: 'cricket sports pune turf team',
  },
];

/** Photo descriptions for screen readers. */
const ALT = {
  'odissi-under-the-stars': 'Odissi dancers in bright costumes performing on an open-air stage in front of a lit temple at night',
  'sitar-after-dark': 'A sitar player and a tabla player performing for a seated audience in a dim hall',
  'pitch-night': 'A founder pitching on stage to a packed audience under blue lights',
  'night-sky-camp': 'A student looking through a telescope set up outdoors at night',
  'paint-a-pattachitra': 'A Pattachitra painting of Jagannath, Balabhadra and Subhadra with detailed borders',
  'old-delhi-food-walk': 'A Chandni Chowk street vendor frying snacks in a large kadhai',
  'hostel-stories': 'A line of comedians on a dark stage under a spotlight, one holding a microphone',
  'block-printing-day': 'A woman pressing a wooden block onto fabric at a printing table in Bagru',
  'marine-drive-10k': 'Marine Drive in Mumbai at night, its curve of street lights along the sea',
  'lo-fi-rooftop': 'Musicians playing keyboard and guitar on a stage at a night concert',
  'build-weekend': 'Hackathon participants working on laptops around a table',
  'biryani-trail': 'Hyderabadi biryani in a copper handi with raita on the side',
  'carnatic-at-dawn': 'A Carnatic vocalist in a yellow saree singing into a microphone',
  'sunset-surf-clinic': 'A surfer riding a wave at sunset',
  'gully-cricket-league': 'Boys playing cricket on a quiet village road',
  'college-street-adda': 'Stacks of second-hand books piled along the shutters of College Street, Kolkata',
};

const loadedAt = new Date();

/** All events with their computed start time, sorted soonest first. */
export const EVENTS = RAW.map((e) => ({ ...e, alt: ALT[e.id] ?? '', start: startsAt(e, loadedAt) })).sort((a, b) => a.start - b.start);

export const CITIES = [...new Set(EVENTS.map((e) => e.city))].sort();

export const getEvent = (id) => EVENTS.find((e) => e.id === id);

/** Seats still free, after subtracting passes booked in this browser. */
export function seatsLeft(event, passes = []) {
  const mine = passes.filter((p) => p.eventId === event.id).reduce((n, p) => n + p.tickets, 0);
  return Math.max(0, event.capacity - event.taken - mine);
}

/** 'open' | 'final' (few seats left) | 'full' */
export function seatStatus(event, passes) {
  const left = seatsLeft(event, passes);
  if (left === 0) return 'full';
  return left <= Math.max(5, event.capacity * 0.15) ? 'final' : 'open';
}

/** Search + filter + sort used by the events explorer. */
export function filterEvents(list, { q = '', category = '', city = '', sort = 'soonest' } = {}) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const out = list.filter((e) => {
    if (category && e.category !== category) return false;
    if (city && e.city !== city) return false;
    const haystack = `${e.title} ${e.city} ${e.venue} ${e.category} ${e.blurb} ${e.tags} ${e.price === 0 ? 'free' : ''}`.toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
  if (sort === 'price') out.sort((a, b) => a.price - b.price || a.start - b.start);
  else if (sort === 'popular') out.sort((a, b) => b.taken / b.capacity - a.taken / a.capacity);
  else out.sort((a, b) => a.start - b.start);
  return out;
}
