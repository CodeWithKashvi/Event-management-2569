import { CITIES, EVENTS } from './events.js';

/*
 * Every city on the route, in route order (roughly along the east coast, across the north,
 * down the west coast and back inland). Hindi names as they appear on station boards.
 * `photo` is the id of an event whose photo stands for the city.
 */
const ROUTE = [
  {
    name: 'Puri',
    hi: 'पुरी',
    state: 'Odisha',
    photo: 'paint-a-pattachitra',
    blurb: 'A seaside temple town on the Bay of Bengal, and the gateway to Raghurajpur, the village where nearly every home is a painter’s studio.',
  },
  {
    name: 'Bhubaneswar',
    hi: 'भुवनेश्वर',
    state: 'Odisha',
    photo: 'odissi-under-the-stars',
    blurb: 'Odisha’s capital and India’s Temple City: centuries-old stone temples, a young startup scene and Odissi on every stage.',
  },
  {
    name: 'Kolkata',
    hi: 'कोलकाता',
    state: 'West Bengal',
    photo: 'college-street-adda',
    blurb: 'The city of adda, books and long conversations over chai, where College Street’s stalls have sold second-hand books for generations.',
  },
  {
    name: 'Delhi',
    hi: 'दिल्ली',
    state: 'Delhi NCR',
    photo: 'old-delhi-food-walk',
    blurb: 'From parathas in the lanes of Chandni Chowk to open mics in Hauz Khas, the capital’s food and comedy never sleep.',
  },
  {
    name: 'Jaipur',
    hi: 'जयपुर',
    state: 'Rajasthan',
    photo: 'block-printing-day',
    blurb: 'The Pink City, and nearby Bagru, where the Chhipa community has printed cloth by hand with wooden blocks for centuries.',
  },
  {
    name: 'Mumbai',
    hi: 'मुंबई',
    state: 'Maharashtra',
    photo: 'marine-drive-10k',
    blurb: 'The Queen’s Necklace after dark, rooftops in Bandra and a city that runs on music and the sea breeze.',
  },
  {
    name: 'Pune',
    hi: 'पुणे',
    state: 'Maharashtra',
    photo: 'gully-cricket-league',
    blurb: 'A student city with a big sporting streak, from floodlit box cricket to weekend treks in the hills around it.',
  },
  {
    name: 'Goa',
    hi: 'गोवा',
    state: 'Goa',
    photo: 'sunset-surf-clinic',
    blurb: 'Quiet beaches in the north, surf lessons in the evening and sunsets over the Arabian Sea.',
  },
  {
    name: 'Bengaluru',
    hi: 'बेंगलुरु',
    state: 'Karnataka',
    photo: 'build-weekend',
    blurb: 'India’s startup capital, where there is almost always a hackathon, a meetup or a demo day this weekend.',
  },
  {
    name: 'Chennai',
    hi: 'चेन्नई',
    state: 'Tamil Nadu',
    photo: 'carnatic-at-dawn',
    blurb: 'The home of Carnatic music, where the December season fills Mylapore with kutcheris from sunrise onwards.',
  },
  {
    name: 'Hyderabad',
    hi: 'हैदराबाद',
    state: 'Telangana',
    photo: 'biryani-trail',
    blurb: 'The city of the Charminar, Irani chai and India’s most passionate argument about who makes the best biryani.',
  },
];

export const slugOf = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Cities that have events, with their slug and events attached. */
export const CITY_LIST = ROUTE.filter((c) => CITIES.includes(c.name)).map((c) => ({
  ...c,
  slug: slugOf(c.name),
  events: EVENTS.filter((e) => e.city === c.name),
}));

export const cityByName = (name) => CITY_LIST.find((c) => c.name === name);
export const cityBySlug = (slug) => CITY_LIST.find((c) => c.slug === slug);
export const cityPath = (name) => `/cities/${slugOf(name)}`;
