/**
 * The corsairs.lol mark — a swallowtail flag on a staff.
 *
 * Takes `currentColor` so it is never tinted to an owner colour, and survives
 * being drawn at 20px, which is the size it is usually read at.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.6 3.4v17.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.9 4.9 20.4 8.1 16.9 10.2 20.4 12.3 7.9 15.5Z" fill="currentColor" />
    </svg>
  );
}
