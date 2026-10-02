/** Pastille avec l'initiale, pour les comptes sans photo (invités). */
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  // Teinte stable dérivée du nom, pour distinguer les joueurs dans le classement.
  const hue = [...name].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 360, 0);

  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full text-xs font-semibold text-bg"
      style={{ width: size, height: size, backgroundColor: `hsl(${hue} 60% 65%)` }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
