import { useEffect, useRef, useCallback } from 'react';

interface GoldShimmerProps {
  width?: number;
  height?: number;
  intensity?: number;
  className?: string;
}

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform float uIntensity;

void main() {
  float shimmer = sin(vUv.x * 6.28 + uTime * 1.5) * 0.5 + 0.5;
  shimmer *= sin(vUv.y * 3.14 + uTime * 0.8) * 0.5 + 0.5;
  shimmer = pow(shimmer, 3.0) * uIntensity;

  vec3 gold = mix(vec3(0.79, 0.66, 0.38), vec3(0.83, 0.69, 0.22), shimmer);
  gl_FragColor = vec4(gold, shimmer * 0.6);
}
`;

export default function GoldShimmer({ width = 40, height = 40, intensity = 0.8, className = '' }: GoldShimmerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const glRef = useRef<any>(null);

  const isVisible = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Guards
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ((navigator.hardwareConcurrency ?? 4) <= 2) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    } catch { return; }
    if (!gl) return;

    glRef.current = gl;
    canvas.width = width * 2;
    canvas.height = height * 2;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uIntensity = gl.getUniformLocation(program, 'uIntensity');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const startTime = performance.now();

    const render = () => {
      if (!isVisible.current) { rafRef.current = requestAnimationFrame(render); return; }
      const t = (performance.now() - startTime) / 1000;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform1f(uTime, t);
      gl!.uniform1f(uIntensity, intensity);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      gl!.deleteProgram(program);
      gl!.deleteShader(vs);
      gl!.deleteShader(fs);
      gl!.deleteBuffer(buf);
    };
  }, [width, height, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`gold-shimmer pointer-events-none ${className}`}
      style={{
        width,
        height,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'screen',
      }}
    />
  );
}
