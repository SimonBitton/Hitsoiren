const ERA_COLORS = {
  prehist: [0.73, 0.55, 0.31],
  antiquite: [0.78, 0.31, 0.22],
  'moyen-age': [0.36, 0.53, 0.43],
  modernes: [0.86, 0.72, 0.45],
  contemporain: [0.86, 0.85, 0.77]
};

const VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  attribute float aSize;
  uniform vec2 uRotation;
  uniform float uAspect;
  varying vec3 vColor;

  void main() {
    float cy = cos(uRotation.y);
    float sy = sin(uRotation.y);
    float cx = cos(uRotation.x);
    float sx = sin(uRotation.x);

    vec3 p = aPosition;
    p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
    p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);

    float depth = 4.1 - p.z;
    gl_Position = vec4((p.x * 2.05) / uAspect, p.y * 2.05, depth * 0.9 - 0.35, depth);
    gl_PointSize = clamp(aSize * (6.5 / depth), 1.2, 7.0);
    vColor = aColor;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    float alpha = smoothstep(0.5, 0.28, distanceToCenter) * 0.9;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function hash(index) {
  const value = Math.sin(index * 91.917) * 43758.5453;
  return value - Math.floor(value);
}

function createPointData(events) {
  const sorted = [...events]
    .filter((event) => Number.isFinite(event._year))
    .sort((left, right) => left._year - right._year);
  const maxPoints = 520;
  const step = Math.max(1, Math.ceil(sorted.length / maxPoints));
  const sample = sorted.filter((_, index) => index % step === 0);
  const stride = 7;
  const data = new Float32Array(sample.length * stride);

  sample.forEach((event, index) => {
    const progress = sample.length > 1 ? index / (sample.length - 1) : 0;
    const angle = progress * Math.PI * 15 - Math.PI * 0.45;
    const radius = 0.7 + Math.sin(progress * Math.PI) * 0.36;
    const jitter = (hash(index) - 0.5) * 0.16;
    const base = index * stride;
    const color = ERA_COLORS[event.era] || [0.8, 0.75, 0.65];

    data[base] = Math.cos(angle) * (radius + jitter);
    data[base + 1] = (progress - 0.5) * 2.7 + (hash(index + 7) - 0.5) * 0.08;
    data[base + 2] = Math.sin(angle) * (radius + jitter);
    data[base + 3] = color[0];
    data[base + 4] = color[1];
    data[base + 5] = color[2];
    data[base + 6] = event.major ? 5.4 : 2.8;
  });

  return { data, count: sample.length, stride };
}

export function initChronosphere(events) {
  const canvas = document.getElementById('chronosphere');
  const stage = canvas?.closest('.chronosphere-stage');
  if (!canvas || !stage || !Array.isArray(events)) return;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: true,
    powerPreference: 'low-power'
  });
  if (!gl) {
    stage.classList.add('chronosphere-fallback');
    return;
  }

  const program = createProgram(gl);
  if (!program) {
    stage.classList.add('chronosphere-fallback');
    return;
  }

  const points = createPointData(events);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, points.data, gl.STATIC_DRAW);
  gl.useProgram(program);

  const strideBytes = points.stride * Float32Array.BYTES_PER_ELEMENT;
  const positionLocation = gl.getAttribLocation(program, 'aPosition');
  const colorLocation = gl.getAttribLocation(program, 'aColor');
  const sizeLocation = gl.getAttribLocation(program, 'aSize');
  const rotationLocation = gl.getUniformLocation(program, 'uRotation');
  const aspectLocation = gl.getUniformLocation(program, 'uAspect');

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, strideBytes, 0);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, strideBytes, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(sizeLocation);
  gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, strideBytes, 6 * Float32Array.BYTES_PER_ELEMENT);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rotation = { x: -0.13, y: -0.45 };
  const target = { x: -0.13, y: -0.45 };
  let isVisible = true;
  let animationFrame = 0;
  let lastTime = performance.now();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const draw = (time) => {
    animationFrame = 0;
    resize();
    const delta = Math.min(40, time - lastTime);
    lastTime = time;

    if (!prefersReducedMotion.matches) {
      target.y += delta * 0.000035;
      rotation.x += (target.x - rotation.x) * 0.055;
      rotation.y += (target.y - rotation.y) * 0.055;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform2f(rotationLocation, rotation.x, rotation.y);
    gl.uniform1f(aspectLocation, canvas.width / Math.max(1, canvas.height));
    gl.drawArrays(gl.POINTS, 0, points.count);

    if (isVisible && !prefersReducedMotion.matches && !document.hidden) {
      animationFrame = requestAnimationFrame(draw);
    }
  };

  const requestDraw = () => {
    if (!animationFrame) animationFrame = requestAnimationFrame(draw);
  };

  stage.addEventListener('pointermove', (event) => {
    if (prefersReducedMotion.matches) return;
    const rect = stage.getBoundingClientRect();
    target.y = ((event.clientX - rect.left) / rect.width - 0.5) * 1.15;
    target.x = ((event.clientY - rect.top) / rect.height - 0.5) * 0.42 - 0.13;
    requestDraw();
  }, { passive: true });

  stage.addEventListener('pointerleave', () => {
    target.x = -0.13;
  }, { passive: true });

  const resizeObserver = new ResizeObserver(requestDraw);
  resizeObserver.observe(stage);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) requestDraw();
    else if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }, { threshold: 0.05 });
  visibilityObserver.observe(stage);

  prefersReducedMotion.addEventListener('change', requestDraw);
  document.addEventListener('visibilitychange', requestDraw);
  requestDraw();
}
