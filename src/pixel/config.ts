import type { PhysicsConfig } from './types';

export const physicsConfig: PhysicsConfig = {
  dissolveStart: 0.68,
  erosion: 0.82,
  cohesion: 0.62,

  gravity: 1.55,
  turbulence: 0.18,
  drag: 0.12,

  fragmentDistance: 1200,
  tailOpacity: 0.8,
  tailFadeCurve: 1.45,

  seed: 42,
};
