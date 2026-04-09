<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";

/** Grid step in viewBox 0–100 space (only H/V/45° segments between joints). */
const STEP = 5;

/** Below `md` — fewer cables, no SVG blur, fewer running dash animations. */
const MOBILE_MQ = "(max-width: 767px)";

/**
 * Same hues as the Lovelace power card (`custom_components/hub_energie/frontend/src/constants/colors.js`):
 * solar export (blue), battery (green), solar (yellow).
 */
const LOVELACE_CABLE_HEX = ["#29b6f6", "#66bb6a", "#fdd835"];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function cableStrokesFromTone(toneIndex) {
  const { r, g, b } = hexToRgb(LOVELACE_CABLE_HEX[toneIndex % LOVELACE_CABLE_HEX.length]);
  return {
    strokeBase: `rgba(${r},${g},${b},0.16)`,
    strokeFlow: `rgba(${r},${g},${b},0.4)`,
    nodeFill: `rgba(${r},${g},${b},0.38)`,
  };
}

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const svgRef = ref(null);
const layerRef = ref(null);
/** @type {import('vue').Ref<'full' | 'lite'>} */
const tier = ref("full");

/** @type {{ import('vue').Ref<Array<{ d: string; x0: number; y0: number; x1: number; y1: number; strokeBase: string; strokeFlow: string; nodeFill: string; flowAnimate: boolean }>> }} */
const cables = ref([]);

/** @type {Animation[]} */
let flowAnimations = [];

function clampGrid(v) {
  const s = Math.round(v / STEP) * STEP;
  return Math.max(0, Math.min(100, s));
}

function rndPoint() {
  return {
    x: clampGrid(12 + Math.random() * 76),
    y: clampGrid(12 + Math.random() * 76),
  };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function turnAngleDeg(prev, next) {
  if (!prev) return 0;
  const la = Math.hypot(prev[0], prev[1]);
  const lb = Math.hypot(next[0], next[1]);
  const c = (prev[0] * next[0] + prev[1] * next[1]) / (la * lb);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

/** Only 0°, 45°, 90° between segments — no 135°/180° bends. */
function allowedDirs(prev) {
  if (!prev) return DIRS;
  return DIRS.filter((d) => {
    const a = turnAngleDeg(prev, d);
    return a < 1e-6 || (a > 44 && a < 46) || (a > 89 && a < 91);
  });
}

function pushPt(pts, x, y) {
  const last = pts[pts.length - 1];
  if (last && last.x === x && last.y === y) return;
  pts.push({ x, y });
}

/**
 * Random “cable run” from A to B on the grid using only orthogonal + diagonal segments.
 * @param {number} wanderCap
 * @param {number} guardCap
 */
function buildCable(start, end, wanderCap = 70, guardCap = 120) {
  let cx = start.x;
  let cy = start.y;
  /** @type {{ x: number; y: number }[]} */
  const pts = [];
  pushPt(pts, cx, cy);
  let prevDir = null;

  for (let n = 0; n < wanderCap; n++) {
    if (dist({ x: cx, y: cy }, end) < 0.1) break;

    const ad = allowedDirs(prevDir);
    const scored = ad
      .map((dir) => {
        const nx = cx + dir[0] * STEP;
        const ny = cy + dir[1] * STEP;
        if (nx < 0 || nx > 100 || ny < 0 || ny > 100) return null;
        return { dir, nx, ny, newD: dist({ x: nx, y: ny }, end) };
      })
      .filter(Boolean);

    let pool = scored.filter((s) => s.newD <= dist({ x: cx, y: cy }, end) + STEP * 2.5);
    if (!pool.length) pool = scored;
    if (!pool.length) break;

    pool.sort((a, b) => a.newD - b.newD);
    const top = pool.slice(0, Math.min(3, pool.length));
    const pick = top[(Math.random() * top.length) | 0];
    const run = 1 + ((Math.random() * 4) | 0);

    for (let r = 0; r < run; r++) {
      cx += pick.dir[0] * STEP;
      cy += pick.dir[1] * STEP;
      cx = Math.max(0, Math.min(100, cx));
      cy = Math.max(0, Math.min(100, cy));
      pushPt(pts, cx, cy);
      if (dist({ x: cx, y: cy }, end) < 0.1) return pts;
    }
    prevDir = pick.dir;
  }

  for (let guard = 0; guard < guardCap && dist({ x: cx, y: cy }, end) > 0.1; guard++) {
    const ad = allowedDirs(prevDir);
    let best = null;
    let bestScore = Infinity;
    for (const dir of ad) {
      const nx = cx + dir[0] * STEP;
      const ny = cy + dir[1] * STEP;
      if (nx < 0 || nx > 100 || ny < 0 || ny > 100) continue;
      const d = dist({ x: nx, y: ny }, end);
      if (d < bestScore) {
        bestScore = d;
        best = dir;
      }
    }
    if (!best) break;
    cx += best[0] * STEP;
    cy += best[1] * STEP;
    pushPt(pts, cx, cy);
    prevDir = best;
  }

  return pts;
}

function pointsToD(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

function pathLen(pts) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) {
    s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return s;
}

function refreshTier() {
  tier.value = window.matchMedia(MOBILE_MQ).matches ? "lite" : "full";
}

function generateCableData() {
  const t = tier.value;
  const target = t === "lite" ? 5 : 11;
  const wanderCap = t === "lite" ? 40 : 70;
  const guardCap = t === "lite" ? 72 : 120;

  /** @type {Array<{ d: string; x0: number; y0: number; x1: number; y1: number; strokeBase: string; strokeFlow: string; nodeFill: string; flowAnimate: boolean }>} */
  const out = [];
  let tries = 0;
  while (out.length < target && tries < 200) {
    tries++;
    const a = rndPoint();
    const b = rndPoint();
    if (dist(a, b) < STEP * 5) continue;
    const pts = buildCable(a, b, wanderCap, guardCap);
    if (pts.length < 3 || pathLen(pts) < STEP * 6) continue;
    const d = pointsToD(pts);
    if (!d) continue;
    const p0 = pts[0];
    const p1 = pts[pts.length - 1];
    const { strokeBase, strokeFlow, nodeFill } = cableStrokesFromTone(out.length);
    out.push({
      d,
      x0: p0.x,
      y0: p0.y,
      x1: p1.x,
      y1: p1.y,
      strokeBase,
      strokeFlow,
      nodeFill,
      flowAnimate: true,
    });
  }

  if (t === "lite") {
    out.forEach((c, i) => {
      c.flowAnimate = i < 3;
    });
  }

  return out;
}

function stopFlowAnimations() {
  flowAnimations.forEach((a) => {
    try {
      a.cancel();
    } catch {
      /* ignore */
    }
  });
  flowAnimations = [];
}

function startFlowAnimations() {
  stopFlowAnimations();
  if (typeof document !== "undefined" && document.hidden) return;
  if (!heroIntersecting) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = svgRef.value;
  if (!root) return;

  const flows = root.querySelectorAll("path.landing-hero-cable-flow");
  flows.forEach((el) => {
    const pathEl = /** @type {SVGPathElement} */ (el);
    const len = pathEl.getTotalLength() || 1;
    const dash = Math.max(2.2, len * 0.085);
    const gap = Math.max(0, len - dash);
    pathEl.style.strokeDasharray = `${dash} ${gap}`;
    pathEl.style.strokeDashoffset = "0";

    const duration =
      tier.value === "lite" ? 12000 + Math.random() * 14000 : 9000 + Math.random() * 11000;
    const anim = pathEl.animate(
      [{ strokeDashoffset: 0 }, { strokeDashoffset: -len }],
      { duration, iterations: Infinity, easing: "linear", delay: -Math.random() * duration },
    );
    flowAnimations.push(anim);
  });
}

/** Hero layer is on-screen (or unknown — assume true if IntersectionObserver unsupported). */
let heroIntersecting = true;

function scheduleAnimations() {
  void nextTick(() => startFlowAnimations());
}

function regenerate() {
  refreshTier();
  stopFlowAnimations();
  cables.value = generateCableData();
  scheduleAnimations();
}

let resizeTimer = 0;
function onResize() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => regenerate(), 160);
}

/** @type {IntersectionObserver | null} */
let io = null;
const mqMobile = typeof window !== "undefined" ? window.matchMedia(MOBILE_MQ) : null;

function onMqChange() {
  regenerate();
}

function onVisibilityChange() {
  if (document.hidden) stopFlowAnimations();
  else scheduleAnimations();
}

onMounted(() => {
  regenerate();

  window.addEventListener("resize", onResize);

  const layer = layerRef.value;
  if (layer && typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(
      (entries) => {
        heroIntersecting = entries[0]?.isIntersecting ?? true;
        if (heroIntersecting && !document.hidden) scheduleAnimations();
        else stopFlowAnimations();
      },
      { threshold: 0, rootMargin: "72px 0px" },
    );
    io.observe(layer);
  }

  mqMobile?.addEventListener("change", onMqChange);
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  window.clearTimeout(resizeTimer);
  mqMobile?.removeEventListener("change", onMqChange);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  io?.disconnect();
  io = null;
  stopFlowAnimations();
});
</script>

<template>
  <div ref="layerRef" class="landing-hero-cables" aria-hidden="true">
    <svg
      ref="svgRef"
      class="landing-hero-cables-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs v-if="tier === 'full'">
        <filter
          id="landing-hero-cable-glow"
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
        >
          <feGaussianBlur stdDeviation="0.45" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        v-for="(c, i) in cables"
        :key="'b-' + i"
        class="landing-hero-cable-base"
        :d="c.d"
        :stroke="c.strokeBase"
      />
      <template v-for="(c, i) in cables" :key="'f-' + i">
        <path
          v-if="tier === 'full' || c.flowAnimate"
          class="landing-hero-cable-flow"
          :d="c.d"
          :stroke="c.strokeFlow"
          :filter="tier === 'full' ? 'url(#landing-hero-cable-glow)' : undefined"
        />
      </template>

      <circle
        v-for="(c, i) in cables"
        :key="'n0-' + i"
        class="landing-hero-cable-node"
        :cx="c.x0"
        :cy="c.y0"
        r="1.15"
        :fill="c.nodeFill"
      />
      <circle
        v-for="(c, i) in cables"
        :key="'n1-' + i"
        class="landing-hero-cable-node"
        :cx="c.x1"
        :cy="c.y1"
        r="1.15"
        :fill="c.nodeFill"
      />
    </svg>
  </div>
</template>
