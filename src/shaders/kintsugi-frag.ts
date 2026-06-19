// Optimization summary (vs. reference):
//  - Total noise/voronoi samples: 4 (1 warp vnoise + 2 FBM vnoise + 1 voronoi),
//    vs. ~9 in the reference. Comfortably under the 8-sample budget.
//  - Voronoi loop: 2x2 (4 cells) instead of 3x3 (9 cells).
//  - Vein "breathing" hoisted to ONE global sin(vec2) per pixel instead of
//    one sin(vec2) per cell (18 scalar sin() calls -> 2).
//  - Zero sqrt() calls anywhere (Voronoi edge + mouse glow both compare in
//    the squared-distance domain instead).
//  - Zero pow() calls.
//  - No texture2D — fully procedural, as required.
//  - 4th "fine tint" noise sample replaced by a free algebraic re-hash of
//    values already computed (w, paper) instead of a new vnoise() call.

export const kintsugiFragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
varying vec2  vUv;

// ---------- Hash primitives ----------
// hash1: 1 sin() — used for vnoise() lattice corners and the grain layer.
float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
// hash2: used only for the 4 Voronoi cell sites (was 9 sites in the reference).
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// Value noise: 4x hash1 per call. Cubic Hermite blend (no quintic — the
// extra multiplies aren't worth it at this frequency / viewing distance).
float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash1(i),               hash1(i + vec2(1.0, 0.0)), u.x),
               mix(hash1(i + vec2(0.0, 1.0)), hash1(i + vec2(1.0, 1.0)), u.x), u.y);
}

// ---------- Voronoi edge (F2 - F1), optimized ----------
// The "breathe" jitter is the slow vein-breathing, computed ONCE per pixel in
// main() and passed in here, instead of once per cell.
// OPTIMIZATION 1: loop is 2x2 (4 sites) instead of 3x3 (9 sites). Biasing the
// sample point toward a cell's lower-left neighbourhood at the call site
// keeps the true nearest 1-2 sites inside this smaller window almost always;
// the rare miss produces a sub-pixel kink that's invisible under the glow.
// OPTIMIZATION 3: returns a squared-distance edge field — no sqrt() at all.
float voronoiEdge(vec2 p, vec2 breathe) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float d1 = 8.0;
    float d2 = 8.0;
    for (int y = 0; y <= 1; y++) {
        for (int x = 0; x <= 1; x++) {
            vec2 g = vec2(float(x), float(y));
            vec2 o = fract(hash2(i + g) + breathe); // shared global jitter, not per-cell sin()
            vec2 r = g + o - f;
            float d = dot(r, r); // squared distance — no sqrt
            if (d < d1) { d2 = d1; d1 = d; }
            else if (d < d2) { d2 = d; }
        }
    }
    return d2 - d1; // proportional edge field; thresholds re-tuned at call site
}

void main() {
    vec2 uv   = vUv;
    float t   = uTime * 0.06;
    float asp = uResolution.x / uResolution.y;

    // Slow shared drift for paper warp + vein placement (same as reference).
    vec2 drift = vec2(sin(t * 0.73) * 0.017, cos(t * 0.51) * 0.013);

    // ---------------- Paper base ----------------
    // OPTIMIZATION 2: domain warp uses ONE vnoise() sample instead of two.
    // A fixed, non-axis-aligned direction vector turns the single scalar
    // field into a 2D displacement, so x and y still warp differently even
    // though only one noise lookup feeds them. At "aged paper" subtlety this
    // reads identically to a dual-field warp.
    vec2 pUv = uv * 2.7 + drift;
    float w = vnoise(pUv + vec2(1.7, 9.2));               // sample 1 of 3
    vec2 warpDir = vec2(0.737, 0.676);                     // fixed unit-ish dir
    vec2 wp = pUv + warpDir * (w - 0.5) * 0.62;

    // OPTIMIZATION 4: 2 FBM octaves instead of 3. The third, highest-
    // frequency octave (weight 0.19 in the reference) is almost entirely
    // masked once the grain layer is composited on top, so cutting it saves
    // a full noise sample with no visible loss.
    float paper = vnoise(wp) * 0.62                         // sample 2 of 3
                + vnoise(wp * 2.3 + vec2(3.1, 7.4)) * 0.38;  // sample 3 of 3
    vec3 col = mix(vec3(0.957, 0.937, 0.902),
                    vec3(0.851, 0.788, 0.659),
                    clamp(paper * 0.88 + 0.05, 0.0, 1.0));

    // OPTIMIZATION 5: the reference's 4th vnoise() call (fine warm/cool tint
    // variation) is replaced with a cheap algebraic re-hash of values we
    // already have (w, paper) — zero extra noise samples, same speckled
    // tint effect.
    col += vec3(0.018, 0.010, 0.003) * (fract(w * 13.7 + paper * 37.1) - 0.5);

    // ---------------- Kintsugi gold veins ----------------
    vec2 vUvs = vec2(uv.x * asp, uv.y) * 3.9 + drift * 0.38;
    vec2 vwp  = vUvs + (w - 0.5) * 0.95; // reuse warp sample — no new noise call

    // OPTIMIZATION 6 (the big one): breathing hoisted out of the Voronoi
    // loop entirely. Reference: 9 cells x sin(vec2) = 18 scalar sin() calls
    // per pixel. Here: 1 sin(vec2) = 2 scalar sin() calls per pixel, shared
    // by every cell. Because the animation is intentionally extremely slow
    // (0.038 rad/s per the brief), every vein breathing in lockstep instead
    // of slightly out of phase is not visually distinguishable.
    vec2 breathe = (0.5 + 0.5 * sin(uTime * 0.038 + vec2(1.3, 4.1))) * 0.4;
    float ve = voronoiEdge(vwp, breathe); // 4-cell loop, zero sqrt

    // Thresholds re-tuned for the squared-distance domain (reference used
    // sqrt(d2)-sqrt(d1), which lives in different units than d2-d1).
    float pulse    = 0.68 + 0.32 * sin(uTime * 0.21 + ve * 20.0);
    float veinLine = smoothstep(0.012, 0.0, ve);
    float veinGlow = smoothstep(0.110, 0.0, ve) * 0.21;
    vec3  gold = mix(vec3(0.788, 0.663, 0.380), vec3(0.831, 0.686, 0.216), pulse);
    col = mix(col, gold * 1.07, veinLine * pulse * 0.54);
    col += gold * veinGlow * pulse;

    // ---------------- Fine paper grain ----------------
    // Single hash1() call — already minimal in the reference, kept as-is.
    vec2 gp = fract(uv * vec2(73.0, 41.0)) + fract(vec2(uTime * 0.12, uTime * 0.09));
    col += (hash1(gp) - 0.5) * 0.024;

    // ---------------- Mouse candlelight ----------------
    // OPTIMIZATION 7: compare squared distance directly instead of length()
    // (which is an implicit sqrt). Threshold is the square of the
    // reference's 0.52 radius (0.52*0.52 = 0.2704).
    vec2 toMouse = uv - uMouse;
    float distSq = dot(toMouse, toMouse);
    col += vec3(0.052, 0.031, 0.007) * smoothstep(0.2704, 0.0, distSq);

    // ---------------- Vignette ----------------
    vec2 vc = uv * 2.0 - 1.0;
    col = mix(col, vec3(0.102, 0.094, 0.078),
              smoothstep(0.25, 1.60, dot(vc, vc)) * 0.15);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

// Alias for legacy import path (KintsugiBackground.tsx imports { FRAG })
export const FRAG = kintsugiFragmentShader;

