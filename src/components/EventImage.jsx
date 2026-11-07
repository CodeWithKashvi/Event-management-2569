const src = (id, w) => `${import.meta.env.BASE_URL}events/${id}-${w}.webp`;

/** Responsive event photo (800w / 1600w WebP, 3:2). */
export default function EventImage({ event, sizes, eager = false, decorative = false, className, style }) {
  return (
    <img
      className={className}
      src={src(event.id, 800)}
      srcSet={`${src(event.id, 800)} 800w, ${src(event.id, 1600)} 1600w`}
      sizes={sizes}
      width="1600"
      height="1067"
      alt={decorative ? '' : event.alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      style={style}
    />
  );
}
