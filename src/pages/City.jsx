import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { CalendarDays, ChevronRight, Ticket } from 'lucide-react';
import { MiniMap } from '../components/CityMap.jsx';
import NextChip from '../components/NextChip.jsx';
import EventCard from '../components/EventCard.jsx';
import EventImage from '../components/EventImage.jsx';
import { StationRow } from '../components/StationBoard.jsx';
import NotFound from './NotFound.jsx';
import { getEvent } from '../data/events.js';
import { CITY_LIST, cityBySlug } from '../data/cities.js';
import { usePasses } from '../lib/passes.js';
import { formatDate, formatPrice, formatTime } from '../lib/schedule.js';
import './Cities.css';

export default function City() {
  const { slug } = useParams();
  const city = cityBySlug(slug);
  const passes = usePasses();

  useEffect(() => {
    document.title = city ? `Events in ${city.name} | Mela` : 'City not found | Mela';
  }, [city]);

  if (!city) return <NotFound />;

  const { events } = city;
  const prices = events.map((e) => e.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const categories = [...new Set(events.map((e) => e.category))];
  const first = events[0];
  const others = CITY_LIST.filter((c) => c.slug !== city.slug);

  return (
    <article className="city-page">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to="/cities" viewTransition>
                Cities
              </Link>
              <ChevronRight size={14} aria-hidden="true" />
            </li>
            <li aria-current="page">{city.name}</li>
          </ol>
        </nav>

        <header className="city-hero">
          <EventImage event={getEvent(city.photo)} eager sizes="(min-width: 1240px) 1240px, 100vw" style={{ viewTransitionName: 'city-photo' }} />
          <div className="city-hero__board">
            <h1 className="city-board" data-page-title tabIndex={-1}>
              <span className="city-board__hi" lang="hi">
                {city.hi}
              </span>
              <span className="city-board__en">{city.name}</span>
            </h1>
            <p className="city-board__state">{city.state}</p>
          </div>
        </header>

        <div className="city-intro">
          <div>
            <p className="city-blurb">{city.blurb}</p>
            <ul className="city-facts">
              <li>
                <Ticket size={18} aria-hidden="true" />
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </li>
              <li>
                <CalendarDays size={18} aria-hidden="true" />
                From {formatDate(first.start)}, {formatTime(first.start)}
              </li>
              <li>{low === high ? formatPrice(low) : `${formatPrice(low)} to ${formatPrice(high)}`}</li>
            </ul>
            <ul className="city-cats" aria-label="Categories">
              {categories.map((c) => (
                <li key={c}>
                  <Link to={`/?city=${encodeURIComponent(city.name)}&cat=${c}`} state={{ explore: true }} className="pill" data-cat={c}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
            <NextChip events={events} label="Next here" />
          </div>
          <div className="city-intro__map">
            <MiniMap city={city.name} />
          </div>
        </div>

        <section className="city-section" aria-labelledby="city-events-title">
          <h2 id="city-events-title" className="section-title">
            What’s on in {city.name}
          </h2>
          <div className="event-grid">
            {events.map((e) => (
              <EventCard key={e.id} event={e} passes={passes} />
            ))}
          </div>
        </section>

        <section className="city-section" aria-labelledby="city-others-title">
          <h2 id="city-others-title" className="section-title">
            Other stations
          </h2>
          <StationRow cities={others} />
        </section>
      </div>
    </article>
  );
}
