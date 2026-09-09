/** Simple inline SVG icons referenced by theme icon ids. */
const paths = {
  cloud: "M6 14.5A3.5 3.5 0 0 1 9.5 11h.3A4.5 4.5 0 0 1 18 12.5 3.5 3.5 0 0 1 17 19H7a3.5 3.5 0 0 1-1-6.9z",
  folder: "M2 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z",
  puzzle: "M12 2a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v2h-1a2 2 0 1 0 0 4h1v2a2 2 0 0 1-2 2h-2v1a2 2 0 1 1-4 0v-1H7a2 2 0 0 1-2-2v-2H4a2 2 0 1 1 0-4h1V7a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2z",
  link: "M8 12a4 4 0 0 1 0-8h2v2H8a2 2 0 1 0 0 4h2v2H8zm6-8h-2v2h2a2 2 0 1 1 0 4h-2v2h2a4 4 0 0 0 0-8zM9 11h6v2H9z",
  display: "M3 4h18v12H3V4zm2 2v8h14V6H5zm4 14h6v-2H9v2z",
  gear: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4l-1.5 1 .3 1.8-1.7 1-1.5-.7-1.5.7-1.7-1 .3-1.8L11 12l1.5-1-.3-1.8 1.7-1 1.5.7 1.5-.7 1.7 1-.3 1.8L21 12z",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z",
};

export const ICON_IDS = Object.keys(paths);

export function ThemeIcon({ name, size = 16, className, title }) {
  const d = paths[name] || paths.cloud;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ verticalAlign: "-0.15em", marginRight: "0.35em" }}
    >
      <path d={d} />
    </svg>
  );
}
