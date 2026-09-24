/**
 * Vorder Smoke Lounge & Sunset Terrace Particle Simulation
 * Realistic 60 FPS Canvas 2D particle emitter for the ashtray and smoking agents.
 */

export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
  wobbleSpeed: number;
  wobbleAmplitude: number;
  wobblePhase: number;
}

export class SmokeParticleSystem {
  private particles: SmokeParticle[] = [];
  private maxParticles = 65;
  private emberGlowPhase = 0;

  // Terrace Emitter centers (in world tile pixel coordinates)
  // Cols 16-23, Rows 1-9: e.g. Ashtray at col 19.5, row 4.5
  private emitters: Array<{ x: number; y: number; rate: number; isAshtray?: boolean }> = [];

  constructor() {
    // Default emitters (world coordinates will be initialized or mapped)
    this.emitters = [
      { x: 19 * 16 + 8, y: 4 * 16 + 8, rate: 0.7, isAshtray: true }, // Ashtray table
      { x: 17 * 16 + 8, y: 3 * 16 + 4, rate: 0.35 },                // Lounge Agent 1
      { x: 21 * 16 + 8, y: 5 * 16 + 4, rate: 0.35 },                // Lounge Agent 2
    ];
  }

  /** Update emitter positions if needed */
  public setEmitters(emitters: Array<{ x: number; y: number; rate: number; isAshtray?: boolean }>) {
    this.emitters = emitters;
  }

  public update(dt: number) {
    this.emberGlowPhase += dt * 3.5;

    // Spawn new particles from emitters
    for (const emitter of this.emitters) {
      if (this.particles.length < this.maxParticles && Math.random() < emitter.rate) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        const speed = 10 + Math.random() * 14;
        const maxLife = 2.2 + Math.random() * 1.8;

        this.particles.push({
          x: emitter.x + (Math.random() - 0.5) * 4,
          y: emitter.y + (Math.random() - 0.5) * 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.2 + Math.random() * 1.5,
          alpha: 0.6,
          maxAlpha: 0.45 + Math.random() * 0.25,
          life: 0,
          maxLife,
          color: Math.random() > 0.3 ? 'rgba(215, 220, 235, ' : 'rgba(180, 190, 210, ',
          wobbleSpeed: 2.0 + Math.random() * 3.0,
          wobbleAmplitude: 0.6 + Math.random() * 0.8,
          wobblePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      const progress = p.life / p.maxLife;

      // Sinusoidal wind drift (subtle terrace breeze from west to east)
      const breeze = 6.0;
      const wobble = Math.sin(p.life * p.wobbleSpeed + p.wobblePhase) * p.wobbleAmplitude;

      p.x += (p.vx + breeze + wobble) * dt;
      p.y += p.vy * dt;

      // Expand gently as smoke rises
      p.radius += dt * 1.8;

      // Fade in quickly, then fade out smoothly
      if (progress < 0.15) {
        p.alpha = (progress / 0.15) * p.maxAlpha;
      } else {
        p.alpha = (1 - progress) * p.maxAlpha;
      }
    }
  }

  /** Render particles to canvas with camera offset and zoom */
  public render(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    zoom: number
  ) {
    ctx.save();

    // 1. Draw Ashtray Glowing Ember tip
    for (const emitter of this.emitters) {
      if (emitter.isAshtray) {
        const screenX = offsetX + emitter.x * zoom;
        const screenY = offsetY + emitter.y * zoom;
        const pulse = (Math.sin(this.emberGlowPhase) + 1) * 0.5;

        // Radial glow
        const glowRadius = (2.5 + pulse * 2.0) * zoom;
        const glowGrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowRadius);
        glowGrad.addColorStop(0, 'rgba(255, 69, 0, 0.9)');
        glowGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.5)');
        glowGrad.addColorStop(1, 'rgba(255, 69, 0, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Hot ember point
        ctx.fillStyle = '#fff7ed';
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(1, 0.8 * zoom), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Draw rising smoke particles
    for (const p of this.particles) {
      const screenX = offsetX + p.x * zoom;
      const screenY = offsetY + p.y * zoom;
      const screenRadius = p.radius * zoom;

      const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, screenRadius);
      grad.addColorStop(0, `${p.color}${p.alpha})`);
      grad.addColorStop(0.7, `${p.color}${p.alpha * 0.5})`);
      grad.addColorStop(1, `${p.color}0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
