import {
  NoWashIcon,
  NoDryCleanIcon,
  SpotCleanIcon,
  SteamIronLowIcon,
} from '../icons/CareIcons';

const composition = [
  { material: 'SATÍN DUCHESSE',    detail: '100% POLIÉSTER',        color: '#1a1aff', part: 'TELA BASE'     },
  { material: 'PÉTALOS DECORATIVOS', detail: '100% PVC',            color: '#ff3c00', part: 'APLICACIONES'  },
  { material: 'OJILLOS Y REMACHES', detail: '100% ALEACIÓN DE ZINC', color: '#c8c8c8', part: 'HERRAJES'      },
];

const careInstructions = [
  { Icon: NoWashIcon,       label: 'NO LAVAR'           },
  { Icon: NoDryCleanIcon,   label: 'NO LAVAR EN SECO'   },
  { Icon: SpotCleanIcon,    label: 'LIMPIEZA LOCALIZADA' },
  { Icon: SteamIronLowIcon, label: 'VAPOR · BAJA TEMP.' },
];

export function EtiquetaSection() {
  return (
    <div
      className="relative w-full select-none"
      style={{
        maxWidth: '360px',
        fontFamily: '"DM Mono", monospace',
        backgroundColor: '#f0ede6',
        border: '1px solid #1a1a1a',
        outline: '3px solid #1a1a1a',
        outlineOffset: '-7px',
        boxShadow: '10px 10px 0px #1a1a1a',
        color: '#1a1a1a',
      }}
    >
      {/* Perforación — efecto etiqueta colgante */}
      <div className="flex justify-center pt-5">
        <div
          className="w-[14px] h-[14px] rounded-full border-[1.5px] border-[#1a1a1a]"
          style={{ backgroundColor: '#f0ede6' }}
        />
      </div>

      {/* Marca */}
      <div className="px-8 pt-3 pb-5 text-center">
        <p className="text-[11px] tracking-[0.38em] uppercase">
          D · N O R I E G A
        </p>
      </div>

      <hr className="border-[#1a1a1a]" />

      {/* Composición */}
      <div className="px-8 py-6">
        <p className="text-[8px] tracking-[0.22em] uppercase mb-5 opacity-50">
          COMPOSICIÓN DE LA PRENDA
        </p>

        <div className="space-y-5">
          {composition.map(({ material, detail, color, part }) => (
            <div key={material}>
              <div className="flex justify-between items-baseline mb-[5px]">
                <span className="text-[8px] tracking-[0.14em] opacity-45">{part}</span>
                <span className="text-[8px] tracking-[0.1em] opacity-45">100%</span>
              </div>
              {/* Barra de color */}
              <div
                className="h-[4px] w-full mb-[6px]"
                style={{ backgroundColor: color, opacity: 0.3 }}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] tracking-[0.07em] font-medium">{material}</span>
                <span className="text-[8px] tracking-[0.14em] opacity-55">{detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#1a1a1a]" />

      {/* Instrucciones de cuidado */}
      <div className="px-8 py-6">
        <p className="text-[8px] tracking-[0.22em] uppercase mb-5 opacity-50">
          INSTRUCCIONES DE CUIDADO
        </p>

        <div className="grid grid-cols-4 gap-x-1 gap-y-3">
          {careInstructions.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-[7px]">
              <div className="opacity-85">
                <Icon />
              </div>
              <span
                className="text-[6.5px] tracking-[0.06em] text-center leading-tight opacity-65"
                style={{ maxWidth: '54px' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#1a1a1a]" />

      {/* Pie */}
      <div className="px-8 py-5 text-center space-y-[5px]">
        <p className="text-[8px] tracking-[0.22em] uppercase">HECHO EN MÉXICO</p>
        <p className="text-[7px] tracking-[0.16em] opacity-40">RN 00001 · MX</p>
      </div>
    </div>
  );
}
