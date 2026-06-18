precision mediump float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
varying vec2  vUv;

// =====================================================================
// 1. HASH — no sin(), mediump-safe
// Replaces the original sin/fract hash. Uses only fract, dot and mul.
// Internal max ~1352, well inside mediump. No transcendental ops.
// =====================================================================
float hash1(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 7.33);
    return fract((p3.x + p3.y) * p3.z);
}

// =====================================================================
// 2. VALUE NOISE — bilinear 4-tap, cubic smoothstep
// Kept lightweight; 3 top-level calls budgeted for the paper layer.
// =====================================================================
float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);          // cubic hermite, cheaper than quintic
    return mix(
        mix(hash1(i),                hash1(i + vec2(1.0, 0.0)), u.x),
        mix(hash1(i + vec2(0.0, 1.0)), hash1(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// =====================================================================
// 3. VORONOI F2-F1 — 1 top-level sample, heavily optimized internals
// Wins:
//   • Global drift vector replaces 9 per-cell sin() calls.
//   • hash2 derived from a single vec3, no second hash1 tap.
//   • Squared distances inside loop; sqrt deferred to final return.
//   • 3×3 search kept for correct F2-F1, but body is ~3× cheaper/cell.
// =====================================================================
float voronoiEdge(vec2 p, float t) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    // Single slow drift — "gentle vein breathing" without per-cell sin()
    vec2 drift = vec2(sin(t * 0.038), cos(t * 0.031)) * 0.06;

    float d1 = 9.0;
    float d2 = 9.0;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 g = vec2(float(x), float(y));
            vec2 cell = i + g;

            // Cheap hash2: one vec3 derivation, zero extra hash calls
            vec3 p3 = fract(vec3(cell.x, cell.y, cell.x) * 0.1031);
            p3 += dot(p3, p3.yzx + 7.33);
            vec2 o = fract((p3.xx + p3.yz) * p3.zy);

            o = o * 0.6 + 0.2 + drift;   // jitter [0.2,0.8] + global drift
            vec2 r = g + o - f;
            float d = dot(r, r);           // squared distance — no sqrt in loop
            if (d < d1) { d2 = d1; d1 = d; }
            else if (d < d2) { d2 = d; }
        }
    }

    return sqrt(d2) - sqrt(d1);            // 2 sqrt total, deferred to end
}

void main() {
    vec2 uv = vUv;
    float t  = uTime * 0.06;
    float asp = uResolution.x / uResolution.y;

    // Slow global paper drift
    vec2 drift = vec2(sin(t * 0.73) * 0.017, cos(t * 0.51) * 0.013);

    // =====================================================================
    // PAPER BASE — 3 value-noise samples (was 5 in reference)
    // Domain warping replaces multi-octave FBM: the two warp layers supply
    // low/mid-frequency variation, and one final sample carries the detail.
    // =====================================================================
    vec2 pUv = uv * 2.7 + drift;

    // Sample 1: low-frequency warp
    float wA = vnoise(pUv + vec2(1.7, 9.2));
    // Sample 2: mid-frequency warp
    float wB = vnoise(pUv * 1.9 + vec2(8.3, 2.8));

    // Domain warp
    vec2 wp = pUv + (wA + wB) * 0.15;

    // Sample 3: final paper noise (higher freq, warped coords)
    float paper = vnoise(wp * 2.2 + vec2(5.7, 1.3));

    // Combine: warps act as implicit octaves, final noise as carrier
    float paperVal = wA * 0.22 + wB * 0.22 + paper * 0.56;
    paperVal = clamp(paperVal * 0.88 + 0.05, 0.0, 1.0);

    vec3 col = mix(
        vec3(0.957, 0.937, 0.902),   // warm off-white #F4EFE6
        vec3(0.851, 0.788, 0.659),   // kraft #D9C9A8
        paperVal
    );

    // Subtle warm tint (reuses wB, no extra sample)
    col += vec3(0.018, 0.010, 0.003) * (wB - 0.5);

    // =====================================================================
    // KINTSUGI VEINS — 1 voronoi sample
    // F2-F1 edges read as fracture lines. Hairline core + soft aureole.
    // Blend is deliberately quiet so veins are noticed only after a moment.
    // =====================================================================
    vec2 vUvs = vec2(uv.x * asp, uv.y) * 3.9 + drift * 0.38;
    vec2 vwp = vUvs + vec2(wA - 0.5, wB - 0.5) * 0.95;

    float ve = voronoiEdge(vwp, uTime);

    // Slow gold pulse along each vein
    float pulse = 0.68 + 0.32 * sin(uTime * 0.21 + ve * 7.3);

    // Hairline core + soft glow
    float veinLine = smoothstep(0.030, 0.002, ve);
    float veinGlow = smoothstep(0.165, 0.000, ve) * 0.21;

    vec3 gold = mix(
        vec3(0.788, 0.663, 0.380),   // deep gold #C9A961
        vec3(0.831, 0.686, 0.216),   // bright gold #D4AF37
        pulse
    );

    // Low-opacity blend keeps the effect archival, not dominant
    col = mix(col, gold * 1.07, veinLine * pulse * 0.54);
    col += gold * veinGlow * pulse;

    // =====================================================================
    // FINE PAPER GRAIN — 1 hash sample
    // High-frequency tactile texture. Extremely slow animation to stay
    // sub-threshold on integrated GPUs.
    // =====================================================================
    vec2 gp = fract(uv * vec2(73.0, 41.0)) + fract(uTime * vec2(0.012, 0.009));
    col += (hash1(gp) - 0.5) * 0.024;

    // =====================================================================
    // MOUSE CANDLELIGHT — sqrt() eliminated
    // Squared-distance falloff via dot(); thresholds adjusted so the
    // curve is visually indistinguishable from the reference.
    // =====================================================================
    vec2 md = uv - uMouse;
    float mDistSq = dot(md, md);
    // smoothstep(0.27, 0.0, d²) approximates smoothstep(0.52, 0.0, √d)
    col += vec3(0.052, 0.031, 0.007) * smoothstep(0.27, 0.0, mDistSq);

    // =====================================================================
    // VIGNETTE — dark warm tint, max 15% blend
    // Already uses squared distance (dot), no length()/sqrt() needed.
    // =====================================================================
    vec2 vc = uv * 2.0 - 1.0;
    col = mix(col, vec3(0.102, 0.094, 0.078), smoothstep(0.25, 1.60, dot(vc, vc)) * 0.15);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}