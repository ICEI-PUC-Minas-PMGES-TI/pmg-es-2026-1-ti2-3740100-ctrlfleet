import { useId, useSyncExternalStore } from 'react';
import { Icon } from '../common/Icon';

function subscribeReducedMotion(onStoreChange) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Trajeto da pista (viewBox 800×420) — o carro segue este path */
const TRACK_PATH =
  'M 40 300 C 120 300, 160 220, 280 200 S 480 160, 560 200 S 680 280, 760 300';

const CAR_ICON_SRC = '/car_icon.png';
const CAR_ICON_SIZE = 96;

const INDICATOR_MODALS = [
  {
    id: 'fleet',
    icon: 'fleet',
    title: 'Frota ativa',
    value: '24 veículos',
    detail: '18 disponíveis agora',
    position: { top: '14%', left: '8%' },
    delay: '0s',
    cycle: '0s',
  },
  {
    id: 'reserva',
    icon: 'reservations',
    title: 'Reserva aprovada',
    value: '#127',
    detail: 'Saída em 10 min',
    position: { top: '22%', right: '10%' },
    delay: '0.15s',
    cycle: '2.5s',
  },
  {
    id: 'km',
    icon: 'chart',
    title: 'KM hoje',
    value: '1.240 km',
    detail: '+12% vs. ontem',
    position: { bottom: '28%', left: '6%' },
    delay: '0.3s',
    cycle: '5s',
  },
  {
    id: 'checklist',
    icon: 'check',
    title: 'Checklist OK',
    value: 'Saída registrada',
    detail: 'Motorista Patrícia M.',
    position: { bottom: '22%', right: '8%' },
    delay: '0.45s',
    cycle: '7.5s',
  },
];

/** Ícone lateral (frente à direita) — centralizado no path */
function FleetCarImage() {
  const half = CAR_ICON_SIZE / 2;
  return (
    <g className="fleet-scene__car-graphic" transform={`translate(${-half}, ${-half})`}>
      <ellipse
        className="fleet-scene__car-trail"
        cx={-14}
        cy={half}
        rx={24}
        ry={7}
        fill="rgba(240, 128, 106, 0.35)"
      />
      <ellipse cx={half} cy={CAR_ICON_SIZE + 4} rx={38} ry={6} fill="rgba(0,0,0,0.35)" />
      <image
        href={CAR_ICON_SRC}
        width={CAR_ICON_SIZE}
        height={CAR_ICON_SIZE}
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}

export function FleetSceneAnimation({ variant = 'login' }) {
  const uid = useId().replace(/:/g, '');
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  return (
    <div className={`fleet-scene fleet-scene--${variant}`} aria-hidden="true">
      <div className="fleet-scene__glow fleet-scene__glow--a" />
      <div className="fleet-scene__glow fleet-scene__glow--b" />

      <svg className="fleet-scene__track" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
        <defs>
          <path id={`trackMotion-${uid}`} d={TRACK_PATH} fill="none" />
          <linearGradient id={`roadGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3d4554" />
            <stop offset="100%" stopColor="#252a33" />
          </linearGradient>
          <filter id={`roadGlow-${uid}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* área verde / urbano sutil */}
        <rect width="800" height="420" fill="rgba(20,35,30,0.25)" />

        {/* pista — faixa larga */}
        <path
          d="M 20 310 C 100 310, 140 215, 270 195 C 400 175, 500 165, 580 195 C 660 225, 720 300, 780 310 L 780 340 C 720 330, 660 255, 580 225 C 500 195, 400 205, 270 225 C 140 245, 100 340, 20 340 Z"
          fill={`url(#roadGrad-${uid})`}
          opacity="0.95"
        />

        {/* acostamento */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="52"
          strokeLinecap="round"
        />

        {/* linha central tracejada */}
        <path
          className="fleet-scene__lane-dash"
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(255,220,120,0.55)"
          strokeWidth="2"
          strokeDasharray="18 14"
          strokeLinecap="round"
        />

        {/* bordas da pista */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="54"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="56"
          strokeLinecap="round"
        />

        {/* trajeto animado (luz) */}
        <path
          className="fleet-scene__track-glow"
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(240,128,106,0.5)"
          strokeWidth="3"
          strokeLinecap="round"
          filter={`url(#roadGlow-${uid})`}
        />

        {/* carro percorrendo a pista */}
        <g className="fleet-scene__car">
          {reducedMotion ? (
            <animateMotion
              dur="0.001s"
              fill="freeze"
              begin="0s"
              rotate="auto"
              calcMode="linear"
              keyPoints="0.55;0.55"
              keyTimes="0;1"
            >
              <mpath href={`#trackMotion-${uid}`} />
            </animateMotion>
          ) : (
            <animateMotion
              dur="10s"
              repeatCount="indefinite"
              rotate="auto"
              calcMode="linear"
            >
              <mpath href={`#trackMotion-${uid}`} />
            </animateMotion>
          )}
          <FleetCarImage />
        </g>

        {/* origem / destino */}
        <g className="fleet-scene__pin fleet-scene__pin--a">
          <circle cx="40" cy="300" r="8" fill="#2563eb" opacity="0.3" />
          <circle cx="40" cy="300" r="4" fill="#3b82f6" />
          <text x="40" y="285" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="600">
            A
          </text>
        </g>
        <g className="fleet-scene__pin fleet-scene__pin--b">
          <circle cx="760" cy="300" r="8" fill="#cf4e36" opacity="0.3" />
          <circle cx="760" cy="300" r="4" fill="#f0806a" />
          <text x="760" y="285" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="600">
            B
          </text>
        </g>
      </svg>

      {/* modais de indicadores */}
      {INDICATOR_MODALS.map((modal) => (
        <div
          className="fleet-scene__modal"
          key={modal.id}
          style={{
            ...modal.position,
            '--modal-delay': modal.delay,
            '--modal-cycle': modal.cycle,
          }}
        >
          <div className="fleet-scene__modal-card">
            <span className="fleet-scene__modal-icon">
              <Icon name={modal.icon} />
            </span>
            <div className="fleet-scene__modal-body">
              <span className="fleet-scene__modal-title">{modal.title}</span>
              <strong className="fleet-scene__modal-value">{modal.value}</strong>
              <span className="fleet-scene__modal-detail">{modal.detail}</span>
            </div>
            <span className="fleet-scene__modal-pulse" aria-hidden="true" />
          </div>
        </div>
      ))}

      {/* painel resumo (só home) */}
      {variant === 'home' ? (
        <div className="fleet-scene__panel fleet-scene__panel--home">
          <div className="fleet-scene__panel-head">
            <span className="fleet-scene__panel-dot" />
            <span>Painel ao vivo</span>
          </div>
          <div className="fleet-scene__panel-bars">
            <span style={{ height: '45%' }} />
            <span style={{ height: '72%' }} />
            <span style={{ height: '58%' }} />
            <span style={{ height: '90%' }} />
            <span style={{ height: '65%' }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
