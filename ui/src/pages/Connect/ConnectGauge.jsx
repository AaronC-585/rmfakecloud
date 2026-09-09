import React from "react";

/** Pairing-code countdown gauge. progress is 0..1 remaining. */
export default function ConnectGauge({ type = "circle", progress = 1, label = "" }) {
  const track = "var(--rm-connect-gauge-track, #3a3f44)";
  const fill = "var(--rm-connect-gauge-fill, #EE7B30)";
  const text = "var(--rm-connect-gauge-text, #f8f7f6)";
  const p = Math.max(0, Math.min(1, progress));

  if (!type || type === "none") {
    return label ? (
      <div className="connect-gauge-label" style={{ color: text }}>
        {label}
      </div>
    ) : null;
  }

  if (type === "bar") {
    return (
      <div className="connect-gauge connect-gauge-bar" role="progressbar" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="connect-gauge-bar-track" style={{ background: track }}>
          <div className="connect-gauge-bar-fill" style={{ width: `${p * 100}%`, background: fill }} />
        </div>
        {label ? (
          <div className="connect-gauge-label" style={{ color: text }}>
            {label}
          </div>
        ) : null}
      </div>
    );
  }

  const size = 160;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const isArc = type === "arc";
  const sweep = isArc ? 0.75 : 1;
  const dash = c * sweep;
  const offset = dash * (1 - p);

  return (
    <div className={`connect-gauge connect-gauge-${type}`} role="progressbar" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <g transform={isArc ? `rotate(135 ${size / 2} ${size / 2})` : `rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} strokeDasharray={isArc ? `${dash} ${c}` : undefined} strokeLinecap="round" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={fill}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </g>
        {label ? (
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={text} fontSize="14">
            {label}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
