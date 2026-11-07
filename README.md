# Mela (मेला): events across India

**Mela** is a responsive website for discovering and booking events in India. You can browse concerts, food walks, hackathons, workshops and sports events in 11 cities, search and filter them, see what's on day by day, read the details, and book a pass in under a minute. Organisers can list their own events too.

Built by **Kashvi Jain** for **K Explore, Web Designing**: _Design and Develop a Responsive Event Management Website_.

**Live site:** `https://<your-github-username>.github.io/mela/` _(replace after the first deploy, see [Deployment](#deployment))_

![Mela home page: a bright white hero reading "Your next FOOD WALK is now boarding." with the word on split-flap tiles, a search bar, and a tilted row of event posters below](docs/screenshots/home.jpg)

## Contents

- [What it does](#what-it-does)
- [The assignment brief, point by point](#the-assignment-brief-point-by-point)
- [Tech stack](#tech-stack)
- [Pages](#pages)
- [Design](#design)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Tests](#tests)
- [Deployment](#deployment)
- [Browser support](#browser-support)
- [Screenshots](#screenshots)
- [Credits](#credits)

---

## What it does

Mela runs entirely in the browser. There is no server and no account: events are part of the site, and everything you book or list is saved on your own device with Local Storage.

**1. Find an event**

- Search from the home page or the events list. Search matches the title, city, venue, category and keywords.
- Filter by **category** (Music, Culture, Food, Tech, Sports, Workshops) and **city**, and sort by soonest, price or popularity. The filters are in the address bar, so a filtered list can be bookmarked or shared.
- Browse by place on the **map of India**, or open a **city page** for one city's events.
- Open the **Calendar** to see the coming weeks day by day, with festivals such as Diwali marked.

**2. Read the details**

Each event page has a photo, the date and time in IST, the venue with Google Maps directions, the price in rupees, the organiser, a description, highlights, the seats left, and a live countdown to the start.

**3. Book a pass**

Enter your name, email, Indian mobile number and the number of passes (1 to 10). Every field is checked as you go. When the booking goes through, a railway-style pass is "printed" with a 10-digit **PNR** and a barcode, and marigold petals fall.

**4. Manage your bookings**

**My passes** lists everything you've booked on this device. Each pass can be added to Google, Apple or Outlook calendar (an `.ics` file) or cancelled. Seat counts update straight away, and other open tabs stay in sync.

**5. Host an event**

Organisers fill in a listing form (name, category, description, date, start time, city, venue, price, seats, contact) and watch a preview card build itself as they type. Listings are saved on the device under **Your listings**.

**Also:** dark and light mode, a "Wrong platform." 404 page, a share button (the phone's share sheet, or copy link on desktop), and a check that stops the same email booking the same event twice. When an event is fully booked, registration closes and similar events that still have space are suggested.

> The event listings are made up for the demo; the venues are real places. Events are scheduled relative to today, so the site always shows upcoming events whenever it's opened.

## The assignment brief, point by point

| Requirement | Where it is |
| --- | --- |
| Attractive hero section | Split-flap headline, search with popular shortcuts, and a conveyor of event posters ([`Home.jsx`](src/pages/Home.jsx), [`PosterMarquee.jsx`](src/components/PosterMarquee.jsx)) |
| Upcoming and featured events | Live departure board ([`DepartureBoard.jsx`](src/components/DepartureBoard.jsx)), "Find your scene" category tiles, "Featured this week" spotlight, India map ([`CityMap.jsx`](src/components/CityMap.jsx)) and the full events grid |
| Event cards with name, date, venue, image, description | [`EventCard.jsx`](src/components/EventCard.jsx), shaped like tickets |
| Search | Hero search and the events-list search box |
| Filter by category | Category chips with live counts, plus city filter and sorting ([`Explorer.jsx`](src/components/Explorer.jsx)) |
| Event details page | `#/events/:id` ([`EventPage.jsx`](src/pages/EventPage.jsx)) |
| Registration form (name, email, phone, event) | [`RegisterForm.jsx`](src/components/RegisterForm.jsx), with number of passes and a live total |
| JavaScript validation | [`validate.js`](src/lib/validate.js): inline messages when you leave a field and on submit (see [Form validation](#form-validation)) |
| Confirmation message | "You're booked!" with the printed pass, PNR and next steps |
| Responsive on phones, tablets and desktops | Tested at 390 px, 768 px, 900 px, 1280 px and 1440 px; the board, filters, calendar, ticket and event page each have their own small-screen layout |

**Bonus challenges (all four done)**

| Bonus | How |
| --- | --- |
| Dark/light mode | Follows the device setting; the toggle remembers your choice and switches with a circular reveal |
| Countdown timers | Days, hours, minutes and seconds on split-flap digits: featured event, every event page, and "next departure" |
| Animations | GSAP and anime.js throughout (see [Animation](#animation)) |
| Local Storage registrations | Bookings and hosted listings are saved in the browser and survive a reload |

## Tech stack

| Layer | Technology | Used for |
| --- | --- | --- |
| UI | **React 19.3** | Components and state |
| Build tool | **Vite 8.3** with `@vitejs/plugin-react` | Dev server and production build |
| Routing | **React Router 8.5** | Hash routing (`#/events/…`), so it works on any static host without server rules; view transitions between pages |
| Animation | **GSAP 3.15** (ScrollTrigger, SplitText) with **@gsap/react** | Page-load sequences and scroll-driven motion |
| Animation | **anime.js 4.5** | Split-flap letters, SVG drawing and motion paths, springs, and feedback such as the booking stamp and petals |
| Date picker | **react-day-picker 10** | The calendar in the Host form (the library shadcn/ui's Calendar is built on), restyled with the site's own CSS |
| Icons | **lucide-react** | All icons |
| Styling | Plain **CSS3** | Custom properties and `light-dark()` for theming, Grid and Flexbox, container queries, `:has()`, `color-mix()`, `@starting-style`, View Transitions |
| Storage | **Local Storage** | Bookings, hosted listings and the theme choice |
| Tests | Node's built-in test runner (`node --test`) | Unit tests with no extra packages |
| Fonts | **Bricolage Grotesque**, **Figtree**, **Rajdhani** (Google Fonts) | Headings, body text, and the split-flap board, digits and Hindi text |
| Hosting | **GitHub Pages** through GitHub Actions | Tests, builds and publishes on every push |

The browser's own platform does the rest: `Intl` for Indian date, time and rupee formatting, a native `<dialog>` for the mobile menu and confirmations, the Web Share API, and Blob downloads for calendar files.

## Pages

| Page | Address | What's on it |
| --- | --- | --- |
| Home | `#/` | Hero with the split-flap headline, live departure board, categories, featured event, India map, how booking works, and the full events list with search and filters |
| Event details | `#/events/:id` | Photo, facts, description, highlights, seats left, countdown, add to calendar, share, and the booking form |
| Calendar | `#/calendar` | The coming weeks as a month grid with event photos on each day, Sundays in red and festivals marked. Picking a day tears a page off a wall calendar to show that day's events. Filter by category; arrow keys move between days. |
| Cities | `#/cities` | A photo card for every city and the map with the whole route |
| A city | `#/cities/:city` | The city's name on a station board, a line about it, its events and the other stations (11 pages from one template) |
| Host an event | `#/host` | Listing form with live preview, calendar date picker and time picker |
| About & FAQ | `#/about` | The idea, how it's built, and answers to common questions |
| My passes | `#/passes` | Every booking on this device, with add to calendar and cancel |
| Not found | any other address | "Wrong platform." with a way back |

On tablets and phones the header folds into a menu that slides in from the side (a native `<dialog>`, so Esc and focus trapping work without extra code).

## Design

_Mela_ means a fair or gathering in Hindi. The design borrows from the most familiar public display in India, the **railway station departure board**:

- The home page opens with **"यात्री कृपया ध्यान दें" (Attention, please)** on a yellow station-style sign. In the headline **"Your next ___ is now boarding"**, the missing word is a **split-flap display** that flips between CONCERT, FOOD WALK, HACKATHON, NIGHT RUN and more, each in its category's colour.
- Under the search, every event rolls past as a **tilted conveyor of posters**, with a **railway track** that draws itself in and a small **train** riding along it.
- **Pick a city** is a dotted **map of India** with a railway route joining all 11 cities.
- Event cards are **tickets** with a perforated stub holding the date, price and a seat meter. A booking prints a **railway pass** with a PNR and a "Confirmed" stamp.
- The **Calendar** is a printed Indian **tear-off wall calendar**: a red band, a big date, the weekday in English and Hindi, Sundays in red and festivals marked.
- The **footer** is the end of the line: a "Your seat is waiting." ticket with the next departure, and every city as a yellow **station board** (Hindi above English).
- Prices are in **₹**, times are in **IST**, and phone numbers are checked as **Indian mobile numbers**. Venues are real: Rabindra Mandap, Ekamra Haat, Chandni Chowk, Marine Drive, College Street and more.

### Colours

Light mode is white and airy, with festival colours as soft tints. Dark mode is **a mela at night**: warm charcoal with a hint of plum, lit by marigold.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| Background | `#FFFFFF` | `#121015` | Page |
| Surface | `#FFFFFF` | `#1D1A21` | Cards, panels, forms |
| Ink | `#15162E` | `#F5F0E9` | Text |
| Marigold | `#FFB627` | `#FFB627` | Primary buttons, highlights, today |
| Sindoor | `#C8361F` | `#FF8A6B` | Errors, "only a few left", Sundays |
| Leaf | `#17734A` | `#4CC38A` | Success, "Boarding" |

Each category has its own colour (Music marigold, Culture rani pink, Food saffron, Tech peacock blue, Sports parrot green, Workshops violet). Text colours meet WCAG AA contrast (4.5:1) in both themes.

## How it works

### Routing

[`main.jsx`](src/main.jsx) sets up a hash router with the pages above and a catch-all 404. Hash addresses (`/#/events/sitar-after-dark`) need no server rewrite rules, so the same build works on GitHub Pages, Netlify and Vercel. After each page change, [`Layout.jsx`](src/components/Layout.jsx) moves keyboard and screen-reader focus to the new page's heading and restores the scroll position.

### Event data and dates

The 16 events live in [`events.js`](src/data/events.js). Each is scheduled **relative to today in IST** (for example "2 days from now at 19:30"), so the demo always has upcoming events and working countdowns; if that time has already passed today, it moves to the same time next week. [`schedule.js`](src/lib/schedule.js) does the IST maths and Indian formatting (`Sat, 8 Nov`, `7:30 pm`, `₹1,200`) with `Intl`. Festival days for the calendars are in [`festivals.js`](src/data/festivals.js).

### Search, filter and sort

`filterEvents()` in `events.js` matches every word typed against an event's title, city, venue, category, description and tags. The category chips show how many events each would have under the current search and city. Filtered-out cards stay in the page and are hidden, so anime.js can animate cards leaving, entering and moving.

### Form validation

[`validate.js`](src/lib/validate.js) holds plain functions, one rule per field, shared by the forms and the tests. Forms use `noValidate`, so these rules run instead of the browser's pop-ups. Errors appear under a field once you leave it, update as you type, and are linked to the field with `aria-describedby`. On submit, every invalid field shakes and focus moves to the first problem.

**Booking form**

| Field | Rule |
| --- | --- |
| Full name | 2 to 60 characters; letters in any script (so "काश्वी" works), spaces, `.`, `'` and `-` |
| Email | `name@domain.tld`, and not already booked for this event |
| Mobile number | A 10-digit Indian mobile number starting with 6 to 9; `+91`, `0`, spaces and dashes are accepted and removed |
| Event | Must exist and must not be fully booked |
| Number of passes | A whole number from 1 to 10, and no more than the seats left |

**Host form**

| Field | Rule |
| --- | --- |
| Event name | 4 to 60 characters |
| Category | Required |
| Description | 20 to 140 characters, with a live count |
| Date | Today or later, at most a year ahead (chosen on a calendar) |
| Start time | A valid time (chosen as hour, minutes and am/pm) |
| City | From the list, or any typed name in letters |
| Venue | 3 to 80 characters |
| Price | A whole number of rupees, 0 for free, at most ₹1,00,000 |
| Seats | 5 to 50,000 |
| Organiser, email | 2 to 60 characters; a valid email |
| Confirmation | The box must be ticked |

### Custom form controls

- **Searchable dropdowns** ([`SearchSelect.jsx`](src/components/SearchSelect.jsx)): every dropdown on the site works like Select2, on the WAI-ARIA combobox pattern. Type to filter (matches are highlighted), use the arrow keys and Enter, Esc to close. Fully booked events are shown but can't be picked, and the Host form accepts a city that isn't on the list.
- **Date picker** ([`Pickers.jsx`](src/components/Pickers.jsx)): a calendar in the style of the shadcn/ui date picker, with quick picks for Today, Tomorrow and This weekend. Days outside the allowed range can't be picked, Sundays are red, and festivals have a small lamp with the month's festivals listed underneath.
- **Time picker**: hour, minutes (every 15) and am/pm as rows of real radio buttons, so arrow keys work. The chosen time shows on split-flap cells like the departure board.

### Local Storage

[`store.js`](src/lib/store.js) is a small list store that shares saved data with React through `useSyncExternalStore`, so the header badge, seat counts and lists update instantly. Bookings are saved under `mela.passes.v1` ([`passes.js`](src/lib/passes.js)), hosted listings under `mela.hosted.v1` ([`hosted.js`](src/lib/hosted.js)) and the theme under `mela.theme`. A `storage` event listener keeps other open tabs in sync. If storage is unavailable (for example in some private windows), the site still works for the current visit.

### Theming

Every colour is a CSS custom property in [`base.css`](src/styles/base.css), written **once** with `light-dark()`, holding its light and dark values side by side:

```css
:root {
  color-scheme: light dark;            /* follow the device setting */
  --bg: light-dark(#ffffff, #121015);
  --ink: light-dark(#15162e, #f5f0e9);
}
:root[data-theme='dark'] { color-scheme: dark; }   /* set by the toggle */
```

The toggle only sets `data-theme`; every colour switches by itself. A small script in `index.html` applies the saved choice before the first paint, so there's no flash. Category tints are mixed from the theme with `color-mix()`, so one rule works in both modes.

### Animation

The page-load moments are choreographed once; everything else moves in response to what you do.

| Moment | Library | How |
| --- | --- | --- |
| Headline words rise on load | GSAP SplitText | `mask: 'words'` with `autoSplit`, so it re-splits when fonts load or the window resizes |
| Split-flap letters (headline word, board, countdowns, times) | anime.js `animate()` | each cell squashes on `scaleY`, shows random letters, then lands on the right one ([`motion.js`](src/lib/motion.js)) |
| Railway track draws itself in | anime.js `svg.createDrawable()` | on a mask path, so the dashed sleepers keep their pattern ([`RailTrack.jsx`](src/components/RailTrack.jsx)) |
| Train runs along the track | anime.js `svg.createMotionPath()` | one path for every car, each slightly offset so the coaches follow the engine |
| Poster conveyor | GSAP ScrollTrigger | endless loop that speeds up with scroll and eases to a stop on hover ([`PosterMarquee.jsx`](src/components/PosterMarquee.jsx)) |
| Sections ease in as you scroll | GSAP `ScrollTrigger.batch()` | each section fades up once |
| "Three stops to your seat" | GSAP ScrollTrigger `pin` + `matchMedia()` | scrolling fills the rail and changes the phone screen; tabs on smaller screens ([`BookingJourney.jsx`](src/components/BookingJourney.jsx)) |
| Filter sidebar glides into place | GSAP ScrollTrigger, scrubbed | from the centre of the layout to its sticky spot (wide screens) |
| Cards fade out and in when filters change | anime.js `animate()` + `stagger()` | changes made mid-fade are queued so none are lost |
| India map draws, pins drop in | anime.js `createTimeline()` + `spring()` | starts when the map scrolls into view ([`CityMap.jsx`](src/components/CityMap.jsx)) |
| Calendar opens | GSAP `timeline()` | days cascade in week by week; the wall calendar swings onto its nail with `elastic.out` ([`Calendar.jsx`](src/pages/Calendar.jsx)) |
| Picking a day tears off the page | anime.js keyframes | a copy of the page swings off its corner and falls, uncovering the new day |
| Calendar category filter | anime.js `spring()` + `stagger()` | the days that still have events spring up |
| Invalid field shake, ticket printing, stamp | anime.js | keyframes, and a `spring()` ease for the stamp |
| Marigold petals on booking | anime.js | 42 petals with random paths |
| Card photo grows into the event page | View Transitions API | React Router `viewTransition` links |
| Dark/light circular reveal | View Transitions API | `clip-path` on the new page snapshot |

With **reduced motion** turned on in the operating system, all of this is switched off and content appears straight away. A **Pause motion** button in the hero also stops the moving parts for anyone who prefers stillness.

### Accessibility

- Semantic landmarks, one `h1` per page, and a skip link.
- Everything works by keyboard, with a visible focus ring. The calendar grid and date picker use arrow keys; dropdowns follow the WAI-ARIA combobox pattern.
- Decorative split-flap cells are hidden from screen readers; each board row and calendar day has a readable label, such as "Sunday, 8 November, Diwali: 1 event".
- Moving content can be paused, and the rotating board pauses on hover or focus.
- Photos have descriptive alt text, form fields have visible labels, and status is never shown by colour alone.
- Cancelling a pass asks for confirmation in a native `<dialog>`.

## Project structure

```
mela/
├── index.html                 # Fonts, meta tags, theme-before-paint script
├── vite.config.js             # Relative base path, dev server on port 5174
├── public/
│   ├── favicon.svg
│   └── events/                # 16 event photos, 800w + 1600w WebP
├── src/
│   ├── main.jsx               # Router setup
│   ├── styles/base.css        # Design tokens, dark mode, buttons, chips, flap cells
│   ├── data/
│   │   ├── events.js          # Events, categories, search/filter, seats
│   │   ├── cities.js          # Route order, Hindi names, states and blurbs for each city
│   │   ├── festivals.js       # Festival days shown on the calendars
│   │   ├── indiaMap.js        # Simplified India outline + city pin positions
│   │   └── credits.json       # Photo credits
│   ├── lib/
│   │   ├── schedule.js        # IST dates, countdown maths, ₹ and time formatting
│   │   ├── validate.js        # Booking and Host form validation rules
│   │   ├── store.js           # Local Storage list store shared with React
│   │   ├── passes.js          # Bookings
│   │   ├── hosted.js          # Hosted listings
│   │   ├── motion.js          # GSAP setup + anime.js effects
│   │   ├── theme.js           # Dark/light mode with view transition
│   │   ├── calendar.js        # .ics download and Google Maps link
│   │   └── useNow.js          # One shared 1-second clock for countdowns
│   ├── components/
│   │   ├── Layout.jsx         # Header, mobile menu, footer
│   │   ├── Explorer.jsx       # Search, filters, sort and the events grid
│   │   ├── EventCard.jsx      # Ticket-shaped event card
│   │   ├── EventImage.jsx     # Responsive event photo
│   │   ├── DepartureBoard.jsx # Live split-flap board
│   │   ├── FlapText.jsx       # Split-flap text cells
│   │   ├── Countdown.jsx      # Days/hours/minutes/seconds countdown
│   │   ├── NextChip.jsx       # "Next departure" chip
│   │   ├── PosterMarquee.jsx  # Poster conveyor
│   │   ├── RailTrack.jsx      # Track and train
│   │   ├── CityMap.jsx        # Map of India with the route
│   │   ├── StationBoard.jsx   # Yellow station boards in the footer
│   │   ├── BookingJourney.jsx # "Three stops to your seat"
│   │   ├── RegisterForm.jsx   # Booking form
│   │   ├── Ticket.jsx         # The printed pass
│   │   ├── Field.jsx          # Label, control, hint and error
│   │   ├── SearchSelect.jsx   # Searchable dropdown
│   │   ├── Pickers.jsx        # Date picker and time picker
│   │   └── categoryIcons.js   # One icon per category
│   └── pages/                 # Home, EventPage, Calendar, Cities, City, Host, About, Passes, NotFound
├── tests/logic.test.js        # Unit tests
├── docs/screenshots/          # Images used in this README
└── .github/workflows/deploy.yml
```

Styles sit next to the component or page that uses them (`Calendar.jsx` imports `Calendar.css`), with shared tokens and building blocks in `base.css`.

## Getting started

You need [Node.js](https://nodejs.org/) **20.19 or newer** (or 22.12+), which Vite 8 requires.

```bash
git clone https://github.com/<your-github-username>/mela.git
cd mela
npm install
npm run dev
```

Then open <http://localhost:5174>.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload on port 5174 |
| `npm test` | Run the unit tests |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Serve the production build locally |

No environment variables or API keys are needed.

## Tests

`npm test` runs 11 unit tests in [`tests/logic.test.js`](tests/logic.test.js) with Node's built-in test runner. They cover:

- every booking-form rule (names in any script, email format and duplicate bookings, Indian mobile numbers, seats left);
- every Host-form rule;
- IST scheduling (events are always in the future at the right Indian time, and dates use India's calendar day, not the computer's time zone);
- search, filters and sorting, and how your own bookings reduce the seats left;
- the time picker's 12-hour to 24-hour conversion, including midnight and noon.

The deploy workflow runs the tests before every build, so a failing test stops a broken site from going live.

## Deployment

### GitHub Pages (already set up)

1. Push this project to a GitHub repository named `mela`, on the `main` branch.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) installs, tests, builds and publishes the site on every push to `main`. The address is `https://<your-github-username>.github.io/mela/`.

`vite.config.js` uses a relative base path (`./`), so the build works from a sub-path like `/mela/` without changes.

### Vercel or Netlify

Import the repository, set the build command to `npm run build` and the output directory to `dist`. Nothing else is needed, because the site uses hash routing.

## Browser support

Built for current versions of **Chrome, Edge, Firefox and Safari** on desktop and mobile. It uses modern CSS (`light-dark()`, `:has()`, `color-mix()`, `@starting-style`). Where the View Transitions API isn't available, pages and themes simply switch without the transition.

## Screenshots

| Events grid | Booking confirmed |
| --- | --- |
| ![Events grid with search, city and sort controls, category chips, and ticket-shaped event cards](docs/screenshots/events.jpg) | ![Event page with the booking card showing "You're booked!" and a printed pass with a PNR](docs/screenshots/booking.jpg) |

| Calendar | Host an event |
| --- | --- |
| ![The What's on calendar with event photos on each day and the tear-off page for Sunday 8 November, Diwali](docs/screenshots/calendar.jpg) | ![The Host an event form beside a live preview card for Rooftop Ghazal Night in Lucknow](docs/screenshots/host.jpg) |

| A city page | Searchable select |
| --- | --- |
| ![Bhubaneswar's city page: an Odissi photo with a yellow station board reading भुवनेश्वर BHUBANESWAR](docs/screenshots/city.jpg) | ![The city dropdown open with "odi" typed, showing Puri and Bhubaneswar in Odisha](docs/screenshots/select.jpg) |

| Dark mode | Phones |
| --- | --- |
| ![Event page for Marine Drive Midnight 10K in dark mode](docs/screenshots/dark.jpg) | ![Three phone screens: the home page with the board, the filtered events list, and an event page with the sticky booking bar](docs/screenshots/mobile.jpg) |

## Credits

The event listings are fictional; the venues are real places. Event photos come from [Wikimedia Commons](https://commons.wikimedia.org/) and are used under the licences below (also listed in the site footer). They were cropped to 3:2 and converted to WebP.

| Event | Photo | Author | Licence |
| --- | --- | --- | --- |
| `odissi-under-the-stars` | [Odissi dance performance at the Khajuraho Dance Festival 2026 088](https://commons.wikimedia.org/wiki/File:Odissi_dance_performance_at_the_Khajuraho_Dance_Festival_2026_088.jpg) | WarmaFiesta | CC BY-SA 4.0 |
| `sitar-after-dark` | [SAA-UK's Summer Solstice event in the Corn Exchange. Sitar. LEEDS 2023](https://commons.wikimedia.org/wiki/File:SAA-UK%27s_Summer_Solstice_event_in_the_Corn_Exchange._Sitar._LEEDS_2023.jpg) | LEEDS 2023 | CC BY-SA 2.0 |
| `pitch-night` | [Startup TNT Pitch Night -2 (49486382121)](https://commons.wikimedia.org/wiki/File:Startup_TNT_Pitch_Night_-2_(49486382121).jpg) | Mack Male from Edmonton, AB, Canada | CC BY-SA 2.0 |
| `night-sky-camp` | [Sidewalk astronomy in Madison - student views the Orion Nebula](https://commons.wikimedia.org/wiki/File:Sidewalk_astronomy_in_Madison_-_student_views_the_Orion_Nebula.png) | Brainandforce | CC BY 4.0 |
| `paint-a-pattachitra` | [Raghurajpur 10](https://commons.wikimedia.org/wiki/File:Raghurajpur_10.jpg) | Rangan Datta Wiki | CC BY-SA 4.0 |
| `old-delhi-food-walk` | [A roadside vendor selling Indian snacks in Chandni Chowk, Delhi](https://commons.wikimedia.org/wiki/File:A_roadside_vendor_selling_Indian_snacks_in_Chandni_Chowk,_Delhi.JPG) | Deeporaj | CC BY-SA 4.0 |
| `hostel-stories` | [Stand-up comedy Bulgaria Club](https://commons.wikimedia.org/wiki/File:Stand-up_comedy_Bulgaria_Club.jpg) | Stanimira dimitrova | CC BY-SA 4.0 |
| `block-printing-day` | [Woman doing Block Printing at Bagru village, Jaipur, India](https://commons.wikimedia.org/wiki/File:Woman_doing_Block_Printing_at_Bagru_village,_Jaipur,_India.jpg) | Anildiggiwal | CC0 |
| `marine-drive-10k` | [Marine Lines Mumbai 2021](https://commons.wikimedia.org/wiki/File:Marine_Lines_Mumbai_2021.jpg) | Dr Vikramjit Kakati | CC BY-SA 4.0 |
| `lo-fi-rooftop` | [Musicians performing on stage at a night concert featuring vibrant lights and energetic atmosphere](https://commons.wikimedia.org/wiki/File:Musicians_performing_on_stage_at_a_night_concert_featuring_vibrant_lights_and_energetic_atmosphere.jpg) | Shixart1985 | CC BY 2.0 |
| `build-weekend` | [Indic Hackathon 2022 Hyderabad, India 15](https://commons.wikimedia.org/wiki/File:Indic_Hackathon_2022_Hyderabad,_India_15.jpg) | Suyash Dwivedi | CC BY-SA 4.0 |
| `biryani-trail` | [Chicken Hyderabadi Biryani](https://commons.wikimedia.org/wiki/File:Chicken_Hyderabadi_Biryani.JPG) | Dheerajk88 | CC BY-SA 4.0 |
| `carnatic-at-dawn` | [Sk Mahathi, during a Carnatic Music concert at Kakkengad, Kannur (183)](https://commons.wikimedia.org/wiki/File:Sk_Mahathi,_during_a_Carnatic_Music_concert_at_Kakkengad,_Kannur_(183).jpg) | Vinayaraj | CC BY-SA 4.0 |
| `sunset-surf-clinic` | [Surfer surfing the wave (Unsplash)](https://commons.wikimedia.org/wiki/File:Surfer_surfing_the_wave_(Unsplash).jpg) | Austin Neill arstyy | CC0 |
| `gully-cricket-league` | [Street Cricket, Uttar Pradesh, India](https://commons.wikimedia.org/wiki/File:Street_Cricket,_Uttar_Pradesh,_India.jpg) | foxypar4c | CC BY 2.0 |
| `college-street-adda` | [College Street Book Bazar on 26 January, 2022 in Kolkata 12](https://commons.wikimedia.org/wiki/File:College_Street_Book_Bazar_on_26_January,_2022_in_Kolkata_12.jpg) | Pinakpani | CC BY-SA 4.0 |

- **Map:** India outline from [Natural Earth](https://www.naturalearthdata.com/) (public domain), using its India point-of-view boundaries, simplified for the web.
- **Festival dates:** [Drik Panchang](https://www.drikpanchang.com/).
- **Fonts:** [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque), [Figtree](https://fonts.google.com/specimen/Figtree) and [Rajdhani](https://fonts.google.com/specimen/Rajdhani), under the SIL Open Font License.
- **Icons:** [Lucide](https://lucide.dev/) (ISC).

## Author

**Kashvi Jain**, for K Explore, Web Designing.
