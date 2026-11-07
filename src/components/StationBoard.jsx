import { Link } from 'react-router';
import './StationBoard.css';

/** A yellow Indian Railways station board (Hindi above English) linking to the city's page. */
export function StationBoard({ city, current = false }) {
  const n = city.events.length;
  return (
    <Link to={`/cities/${city.slug}`} viewTransition className="station" aria-current={current ? 'page' : undefined}>
      <span className="station__hi" lang="hi" aria-hidden="true">
        {city.hi}
      </span>
      <span className="station__en">{city.name}</span>
      <span className="station__meta">
        {n} {n === 1 ? 'event' : 'events'}
      </span>
    </Link>
  );
}

/** A platform of station boards: one row on wide screens, a swipeable strip on small ones. */
export function StationRow({ cities, current }) {
  return (
    <ul className="stations__list">
      {cities.map((c) => (
        <li key={c.slug}>
          <StationBoard city={c} current={c.slug === current} />
        </li>
      ))}
    </ul>
  );
}
