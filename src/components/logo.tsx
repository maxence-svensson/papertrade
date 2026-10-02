/** Logo : trois bougies stylisées sur fond or. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 28 28" className="shrink-0">
      <rect width="28" height="28" rx="7" fill="var(--color-primary)" />
      <g fill="var(--color-on-primary)">
        <rect x="6.5" y="11" width="3.5" height="8" rx="1" />
        <rect x="7.75" y="8" width="1" height="14" rx="0.5" />
        <rect x="12.25" y="7" width="3.5" height="9" rx="1" />
        <rect x="13.5" y="5" width="1" height="13" rx="0.5" />
        <rect x="18" y="12.5" width="3.5" height="6.5" rx="1" />
        <rect x="19.25" y="10" width="1" height="12" rx="0.5" />
      </g>
    </svg>
  );
}
