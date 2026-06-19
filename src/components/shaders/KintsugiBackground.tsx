import { useEffect, useRef } from 'react';
// P3-09: moved shader source out of repo root into src/shaders/ — Astro
// convention is to keep all source under src/. Renamed to .ts so tsc
// parses the template-literal GLSL correctly (was .js which confused
// the TS parser into trying to typecheck raw GLSL as JavaScript).
import { FRAG } from '../../shaders/kintsugi-frag';

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

interface KintsugiBackgroundProps {
  className?: string;
}

export default function KintsugiBackground({ className = '' }: KintsugiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Bail on reduced motion or low-end devices
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ((navigator.hardwareConcurrency ?? 4) <= 2) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', { alpha: false, premultipliedAlpha: false, antialias: false });
    } catch { return; }
    if (!gl) return;

    // Compile shaders
    const compile = (type: number, src: string) => {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error('Shader error:', gl!.getShaderInfoLog(s));
        gl!.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uMouse = gl.getUniformLocation(program, 'uMouse');

    // Mouse state (normalised 0–1)
    const mouse = { x: 0.5, y: 0.5 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // Resize canvas to cover viewport (hero section only)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5); // cap at 1.5x for perf
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Visibility / intersection controls
    let isVisible = true;
    let rafId = 0;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const startTime = performance.now();

    const render = () => {
      if (!isVisible) { rafId = requestAnimationFrame(render); return; }
      const t = (performance.now() - startTime) / 1000;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform1f(uTime, t);
      gl!.uniform2f(uResolution, canvas.width, canvas.height);
      gl!.uniform2f(uMouse, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', resize);
      gl!.deleteProgram(program);
      gl!.deleteShader(vs);
      gl!.deleteShader(fs);
      gl!.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`kintsugi-bg pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
