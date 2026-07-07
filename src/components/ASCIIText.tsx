// Ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;
    float waveFactor = uEnableWaves;
    vec3 transformed = position;
    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

declare global {
  interface Math {
    map: (n: number, start: number, stop: number, start2: number, stop2: number) => number;
  }
}

Math.map = function (n, start, stop, start2, stop2) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
};

const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

class AsciiFilter {
  renderer: THREE.WebGLRenderer;
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  deg: number;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width: number = 0;
  height: number = 0;
  cols: number = 0;
  rows: number = 0;
  center: { x: number; y: number } = { x: 0, y: 0 };
  mouse: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    renderer: THREE.WebGLRenderer,
    { fontSize, fontFamily, charset, invert }: { fontSize?: number; fontFamily?: string; charset?: string; invert?: boolean } = {}
  ) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

    (this.context as any).webkitImageSmoothingEnabled = false;
    (this.context as any).mozImageSmoothingEnabled = false;
    (this.context as any).msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();
    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText('A').width;
    this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
    this.rows = Math.floor(this.height / this.fontSize);
    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    Object.assign(this.pre.style, {
      fontFamily: this.fontFamily,
      fontSize: `${this.fontSize}px`,
      margin: '0',
      padding: '0',
      lineHeight: '1em',
      position: 'absolute',
      left: '0',
      top: '0',
      zIndex: '9',
      backgroundAttachment: 'fixed',
      mixBlendMode: 'difference',
      userSelect: 'none',
    });
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    if (w && h) this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    this.asciify(this.context, w, h);
    this.hue();
  }

  onMouseMove(e: MouseEvent) {
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() { return this.mouse.x - this.center.x; }
  get dy() { return this.mouse.y - this.center.y; }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!w || !h) return;
    const imgData = ctx.getImageData(0, 0, w, h).data;
    let str = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = x * 4 + y * 4 * w;
        const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
        if (a === 0) { str += ' '; continue; }
        let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * (this.charset.length - 1));
        if (this.invert) idx = this.charset.length - idx - 1;
        str += this.charset[idx];
      }
      str += '\n';
    }
    this.pre.innerHTML = str;
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}

class CanvasTxt {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  txt: string;
  lines: string[];
  fontSize: number;
  fontFamily: string;
  color: string;
  font: string;

  constructor(
    txt: string,
    { fontSize = 200, fontFamily = 'Arial', color = '#fdf9f3', multiLine = false }: {
      fontSize?: number; fontFamily?: string; color?: string; multiLine?: boolean;
    } = {}
  ) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.txt = txt;
    // Split on explicit \n or on spaces if multiLine requested
    this.lines = multiLine
      ? txt.includes('\n') ? txt.split('\n') : txt.split(' ')
      : [txt];
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    this.context.font = this.font;
    const lineH = this.fontSize * 1.15;
    const widths = this.lines.map(l => this.context.measureText(l).width);
    const maxW = Math.max(...widths);
    const firstMetrics = this.context.measureText(this.lines[0]);
    const lineCapH = firstMetrics.actualBoundingBoxAscent + firstMetrics.actualBoundingBoxDescent;
    this.canvas.width = Math.ceil(maxW) + 20;
    this.canvas.height = Math.ceil(lineH * (this.lines.length - 1) + lineCapH) + 20;
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    const lineH = this.fontSize * 1.15;
    this.lines.forEach((line, i) => {
      const m = this.context.measureText(line);
      // Center each line horizontally
      const x = (this.canvas.width - m.width) / 2;
      const y = 10 + i * lineH + m.actualBoundingBoxAscent;
      this.context.fillText(line, x, y);
    });
  }

  get width() { return this.canvas.width; }
  get height() { return this.canvas.height; }
  get texture() { return this.canvas; }
}

class CanvAscii {
  textString: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  container: HTMLElement;
  width: number;
  height: number;
  enableWaves: boolean;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  mouse: { x: number; y: number };
  center: { x: number; y: number } = { x: 0, y: 0 };
  textCanvas!: CanvasTxt;
  texture!: THREE.CanvasTexture;
  geometry!: THREE.PlaneGeometry;
  material!: THREE.ShaderMaterial;
  mesh!: THREE.Mesh;
  renderer!: THREE.WebGLRenderer;
  filter!: AsciiFilter;
  animationFrameId: number = 0;
  onMouseMove: (evt: MouseEvent | TouchEvent) => void;

  constructor(
    { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves }: {
      text: string; asciiFontSize: number; textFontSize: number;
      textColor: string; planeBaseHeight: number; enableWaves: boolean;
    },
    containerElem: HTMLElement,
    width: number,
    height: number
  ) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.camera.position.z = 30;
    this.scene = new THREE.Scene();
    this.mouse = { x: width / 2, y: height / 2 };
    this.onMouseMove = this._onMouseMove.bind(this);
  }

  async init() {
    try {
      await document.fonts.load('600 200px "IBM Plex Mono"');
      await document.fonts.load('500 12px "IBM Plex Mono"');
    } catch (_) {}
    await document.fonts.ready;
    this.setMesh();
    this.setRenderer();
  }

  // Returns plane dimensions that fit the text within the visible frustum
  computePlaneDimensions(containerW: number, containerH: number) {
    const fovRad = (45 * Math.PI) / 180;
    const visH = 2 * Math.tan(fovRad / 2) * this.camera.position.z; // ~24.85 units
    const visW = visH * (containerW / containerH);
    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const isPortrait = containerH > containerW * 1.1;

    if (isPortrait) {
      // Portrait: fit to 90% of visible width
      let planeW = visW * 0.90;
      let planeH = planeW / textAspect;
      // But ensure it's at least 30% of visible height
      if (planeH < visH * 0.30) {
        planeH = visH * 0.30;
        planeW = planeH * textAspect;
        // Cap width at 95%
        if (planeW > visW * 0.95) {
          planeW = visW * 0.95;
          planeH = planeW / textAspect;
        }
      }
      return { planeW, planeH };
    }

    // Landscape/desktop: fit to 80% of visible width, capped at 40% height
    let planeW = visW * 0.80;
    let planeH = planeW / textAspect;
    if (planeH > visH * 0.40) {
      planeH = visH * 0.40;
      planeW = planeH * textAspect;
    }
    return { planeW, planeH };
  }

  setMesh() {
    // Portrait mode: split text into two lines for readability
    const isPortrait = this.height > this.width * 1.1;
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: 'IBM Plex Mono',
      color: this.textColor,
      multiLine: isPortrait,
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;

    const { planeW, planeH } = this.computePlaneDimensions(this.width, this.height);

    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: 'IBM Plex Mono',
      fontSize: this.asciiFontSize,
      invert: true,
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('touchmove', this.onMouseMove);
  }

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.filter.setSize(w, h);
    this.center = { x: w / 2, y: h / 2 };
    // Recalculate text layout and plane geometry for new viewport
    if (this.mesh && this.material) {
      const isPortrait = h > w * 1.1;
      this.textCanvas = new CanvasTxt(this.textString, {
        fontSize: this.textFontSize,
        fontFamily: 'IBM Plex Mono',
        color: this.textColor,
        multiLine: isPortrait,
      });
      this.textCanvas.resize();
      this.textCanvas.render();
      this.texture.dispose();
      this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
      this.texture.minFilter = THREE.NearestFilter;
      this.material.uniforms.uTexture.value = this.texture;
      const { planeW, planeH } = this.computePlaneDimensions(w, h);
      this.geometry.dispose();
      this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
      this.mesh.geometry = this.geometry;
    }
  }

  load() { this.animate(); }

  _onMouseMove(evt: MouseEvent | TouchEvent) {
    const e = (evt as TouchEvent).touches ? (evt as TouchEvent).touches[0] : (evt as MouseEvent);
    const bounds = this.container.getBoundingClientRect();
    this.mouse = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
  }

  animate() {
    const loop = () => {
      this.animationFrameId = requestAnimationFrame(loop);
      this.render();
    };
    loop();
  }

  render() {
    const time = Date.now() * 0.001;
    this.textCanvas.render();
    this.texture.needsUpdate = true;
    this.material.uniforms.uTime.value = Math.sin(time);
    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    const x = Math.map(this.mouse.y, 0, this.height, 0.5, -0.5);
    const y = Math.map(this.mouse.x, 0, this.width, -0.5, 0.5);
    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
  }

  clear() {
    this.scene.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.Material;
        if (mat && typeof (mat as any).dispose === 'function') {
          Object.values(mat as any).forEach((v: any) => {
            if (v && typeof v.dispose === 'function') v.dispose();
          });
          mat.dispose();
        }
        mesh.geometry?.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.filter) {
      this.filter.dispose();
      if (this.filter.domElement.parentNode) {
        this.container.removeChild(this.filter.domElement);
      }
    }
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('touchmove', this.onMouseMove);
    this.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}

interface ASCIITextProps {
  text?: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
}

export default function ASCIIText({
  text = 'NOSTALGIA PROGRAMADA',
  asciiFontSize = 8,
  textFontSize = 200,
  textColor = '#f0ede6',
  planeBaseHeight = 10,
  enableWaves = true,
}: ASCIITextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<CanvAscii | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    const createAndInit = async (container: HTMLElement, w: number, h: number) => {
      const instance = new CanvAscii(
        { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves },
        container,
        w,
        h
      );
      await instance.init();
      return instance;
    };

    const setup = async () => {
      const { width, height } = containerRef.current!.getBoundingClientRect();

      if (width === 0 || height === 0) {
        observer = new IntersectionObserver(async ([entry]) => {
          if (cancelled) return;
          if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
            const { width: w, height: h } = entry.boundingClientRect;
            observer!.disconnect();
            observer = null;
            if (!cancelled) {
              asciiRef.current = await createAndInit(containerRef.current!, w, h);
              if (!cancelled && asciiRef.current) asciiRef.current.load();
            }
          }
        }, { threshold: 0.1 });
        observer.observe(containerRef.current!);
        return;
      }

      asciiRef.current = await createAndInit(containerRef.current!, width, height);
      if (!cancelled && asciiRef.current) {
        asciiRef.current.load();
        ro = new ResizeObserver(entries => {
          if (!entries[0] || !asciiRef.current) return;
          const { width: w, height: h } = entries[0].contentRect;
          if (w > 0 && h > 0) asciiRef.current!.setSize(w, h);
        });
        ro.observe(containerRef.current!);
      }
    };

    setup();

    return () => {
      cancelled = true;
      observer?.disconnect();
      ro?.disconnect();
      if (asciiRef.current) {
        asciiRef.current.dispose();
        asciiRef.current = null;
      }
    };
  }, [text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves]);

  return (
    <div
      ref={containerRef}
      className="ascii-text-container"
      style={{ position: 'absolute', inset: 0 }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&display=swap');

        .ascii-text-container canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          image-rendering: pixelated;
        }

        .ascii-text-container pre {
          margin: 0;
          padding: 0;
          user-select: none;
          line-height: 1em;
          text-align: left;
          position: absolute;
          left: 0;
          top: 0;
          background-image: radial-gradient(circle, #ff6188 0%, #fc9867 50%, #ffd866 100%);
          background-attachment: fixed;
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          z-index: 9;
          mix-blend-mode: difference;
        }
      `}</style>
    </div>
  );
}
