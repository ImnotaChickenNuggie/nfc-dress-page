const iconProps = {
  width: 36,
  height: 36,
  viewBox: '0 0 36 36',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// No lavar — tina con X encima
export function NoWashIcon() {
  return (
    <svg {...iconProps} aria-label="No lavar">
      {/* Tina */}
      <path d="M4 14h28v8a6 6 0 01-6 6H10a6 6 0 01-6-6v-8z" />
      <path d="M4 14c0-2 1.5-3 3-3h22c1.5 0 3 1 3 3" />
      {/* Asas */}
      <path d="M12 11V9a2 2 0 114 0v2M20 11V9a2 2 0 114 0v2" />
      {/* X */}
      <line x1="11" y1="19" x2="25" y2="25" strokeWidth={2} />
      <line x1="25" y1="19" x2="11" y2="25" strokeWidth={2} />
    </svg>
  );
}

// No lavar en seco — círculo con X encima y letra A
export function NoDryCleanIcon() {
  return (
    <svg {...iconProps} aria-label="No lavar en seco">
      <circle cx="18" cy="18" r="13" />
      <text
        x="18"
        y="23"
        textAnchor="middle"
        fontSize="12"
        fontFamily="DM Mono, monospace"
        fill="currentColor"
        stroke="none"
      >
        A
      </text>
      <line x1="8" y1="8" x2="28" y2="28" strokeWidth={2} />
      <line x1="28" y1="8" x2="8" y2="28" strokeWidth={2} />
    </svg>
  );
}

// Limpieza localizada — gota con dedo
export function SpotCleanIcon() {
  return (
    <svg {...iconProps} aria-label="Solo limpieza localizada">
      {/* Marco cuadrado */}
      <rect x="4" y="4" width="28" height="28" rx="2" />
      {/* Gota */}
      <path d="M18 10 C18 10 12 17 12 21a6 6 0 0012 0c0-4-6-11-6-11z" />
      {/* Punto de aplicación */}
      <circle cx="18" cy="22" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Planchar solo con vapor a baja temperatura — plancha con vapor y un punto
export function SteamIronLowIcon() {
  return (
    <svg {...iconProps} aria-label="Planchar solo con vapor a baja temperatura">
      {/* Cuerpo de la plancha */}
      <path d="M6 20h20a2 2 0 002-2v-2a2 2 0 00-2-2H10l-4 6z" />
      {/* Mango */}
      <path d="M18 16v-4a2 2 0 00-2-2h-2" />
      {/* Un punto = baja temperatura */}
      <circle cx="13" cy="20" r="1.5" fill="currentColor" stroke="none" />
      {/* Líneas de vapor */}
      <path d="M10 25 Q11 23 10 21" />
      <path d="M15 26 Q16 24 15 22" />
      <path d="M20 25 Q21 23 20 21" />
    </svg>
  );
}
