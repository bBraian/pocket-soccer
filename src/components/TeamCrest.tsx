import type { Team } from '../types';

interface Props {
  team: Team;
  size?: number;
}

// Renders a real flag (nations, via flag-icons) or a generated two-tone shield
// badge (clubs) — never a real club crest.
export function TeamCrest({ team, size = 40 }: Props) {
  if (team.type === 'nation' && team.flagCode) {
    return (
      <span
        className={`fi fi-${team.flagCode} crest-flag`}
        style={{ width: size, height: size, fontSize: 0 }}
        aria-label={team.name}
      />
    );
  }
  return <ClubBadge team={team} size={size} />;
}

function ClubBadge({ team, size }: { team: Team; size: number }) {
  const initials = team.badgeInitials ?? team.name.slice(0, 2).toUpperCase();
  const fontSize = initials.length > 2 ? 8 : 11;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 34"
      aria-label={team.name}
      role="img"
    >
      <defs>
        <clipPath id={`shield-${team.id}`}>
          <path d="M16 1 L30 5 V17 C30 26 24 31 16 33 C8 31 2 26 2 17 V5 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#shield-${team.id})`}>
        <rect x="0" y="0" width="32" height="34" fill={team.colorPrimary} />
        <polygon points="0,0 32,0 0,34" fill={team.colorSecondary} />
      </g>
      <path
        d="M16 1 L30 5 V17 C30 26 24 31 16 33 C8 31 2 26 2 17 V5 Z"
        fill="none"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="1.5"
      />
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="800"
        fill="#fff"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="0.5"
        fontFamily="system-ui, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}

// Small colored star row for difficulty (1..5).
export function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="stars" aria-label={`Dificuldade ${level}`}>
      {'★'.repeat(level)}
      <span className="stars-off">{'★'.repeat(5 - level)}</span>
    </span>
  );
}
