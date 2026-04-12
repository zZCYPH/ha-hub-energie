/**
 * SVG symbol defs for power-flow nodes (Lit svg`` fragments for defs).
 */
import { svg } from "lit";

export function flowIconDefs(gid) {
  const u = gid;
  return svg`
    <symbol id="hub-${u}-ic-sun" viewBox="-14 -14 28 28">
      <circle cx="0" cy="0" r="4.2" fill="currentColor" opacity="0.95"></circle>
      <g stroke="currentColor" stroke-width="1.85" stroke-linecap="round" fill="none" opacity="0.9">
        <line x1="0" y1="-9.5" x2="0" y2="-6.4"></line>
        <line x1="0" y1="6.4" x2="0" y2="9.5"></line>
        <line x1="-9.5" y1="0" x2="-6.4" y2="0"></line>
        <line x1="6.4" y1="0" x2="9.5" y2="0"></line>
        <line x1="-6.8" y1="-6.8" x2="-4.8" y2="-4.8"></line>
        <line x1="4.8" y1="4.8" x2="6.8" y2="6.8"></line>
        <line x1="6.8" y1="-6.8" x2="4.8" y2="-4.8"></line>
        <line x1="-4.8" y1="4.8" x2="-6.8" y2="6.8"></line>
      </g>
    </symbol>
    <symbol id="hub-${u}-ic-grid" viewBox="-14 -14 28 28">
      <path
        fill="currentColor"
        d="M-1.2-9.2 L4.2-2.4 L2.1-0.8 L6.8 6.2 L4.5 7.8 L-0.2 0.6 L-3.8 3.4 L-6.6-1.2 L-2.8-4.2 L-5.6-8.4 Z"
        opacity="0.95"
      ></path>
    </symbol>
    <symbol id="hub-${u}-ic-home" viewBox="-14 -14 28 28">
      <path
        fill="currentColor"
        d="M0-8.2 L9.2 1.2 L7.2 1.2 L7.2 8.2 L2.2 8.2 L2.2 4.2 L-2.2 4.2 L-2.2 8.2 L-7.2 8.2 L-7.2 1.2 L-9.2 1.2 Z"
        opacity="0.92"
      ></path>
    </symbol>
    <symbol id="hub-${u}-ic-batt" viewBox="-14 -14 28 28">
      <rect
        x="-7"
        y="-5.5"
        width="14"
        height="11"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        opacity="0.9"
      ></rect>
      <rect x="-2.5" y="-7.2" width="5" height="2.2" rx="0.6" fill="currentColor" opacity="0.85"></rect>
      <text x="0" y="4.5" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" opacity="0.95">
        B
      </text>
    </symbol>
    <symbol id="hub-${u}-ic-q" viewBox="-14 -14 28 28">
      <text x="0" y="5" text-anchor="middle" font-size="16" font-weight="700" fill="currentColor">?</text>
    </symbol>
  `;
}

export function flowIconUseHref(gid, iconKey) {
  if (iconKey === "battery_unknown") return `hub-${gid}-ic-q`;
  if (iconKey === "battery") return `hub-${gid}-ic-batt`;
  if (iconKey === "grid") return `hub-${gid}-ic-grid`;
  if (iconKey === "home") return `hub-${gid}-ic-home`;
  return `hub-${gid}-ic-sun`;
}
