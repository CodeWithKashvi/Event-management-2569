import { useEffect } from 'react';
import { Link } from 'react-router';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | Mela';
  }, []);

  return (
    <div className="container notfound">
      <p className="notfound__code" aria-hidden="true">
        404
      </p>
      <h1 className="page-title" data-page-title tabIndex={-1}>
        Wrong platform.
      </h1>
      <p>This page doesn&rsquo;t exist. The link may have a typo, or the event has left the station.</p>
      <Link to="/" className="btn btn--primary">
        Back to all events
      </Link>
    </div>
  );
}
