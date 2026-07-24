export interface ConfettiHandle {
  stop(): void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
}

const PARTICLE_COUNT = 150;
const FALL_DURATION_MS = 4000;
const FADE_DURATION_MS = 1000;

function spawnParticle(width: number, height: number, colors: string[]): Particle {
  return {
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.5,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
  };
}

export function startConfetti(canvas: HTMLCanvasElement, colors: string[]): ConfettiHandle {
  const ctx = canvas.getContext('2d')!;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: PARTICLE_COUNT }, () =>
    spawnParticle(canvas.width, canvas.height, colors)
  );

  let rafId = 0;
  let elapsed = 0;
  let last = performance.now();

  function draw(fadeOut: number) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      if (p.y > canvas.height + 20) {
        Object.assign(p, spawnParticle(canvas.width, canvas.height, colors));
        p.y = -20;
      }
      ctx.save();
      ctx.globalAlpha = fadeOut;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
  }

  function loop(now: number) {
    elapsed += now - last;
    last = now;
    const fadeOut = elapsed > FALL_DURATION_MS
      ? Math.max(0, 1 - (elapsed - FALL_DURATION_MS) / FADE_DURATION_MS)
      : 1;
    draw(fadeOut);
    if (elapsed < FALL_DURATION_MS + FADE_DURATION_MS) {
      rafId = requestAnimationFrame(loop);
    }
  }
  rafId = requestAnimationFrame(loop);

  return {
    stop() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    },
  };
}
