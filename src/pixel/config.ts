import type { PhysicsConfig } from './types';

export const physicsPresets = {
  'chunky-collapse': {
    dissolveStart: 0.62,
    erosion: 0.88,
    cohesion: 0.82,

    gravity: 1.8,
    turbulence: 0.10,
    drag: 0.16,

    fragmentDistance: 1500,

    tailOpacity: 0.85,
    tailFadeCurve: 1.25,

    seed: 73,
  },

  'digital-decay': {
    dissolveStart: 0.55,
    erosion: 0.76,
    cohesion: 0.32,

    gravity: 1.25,
    turbulence: 0.38,
    drag: 0.08,

    fragmentDistance: 1400,

    tailOpacity: 0.72,
    tailFadeCurve: 1.8,

    seed: 137,
  },

  'heavy-gravity': {
    dissolveStart: 0.64,
    erosion: 0.84,
    cohesion: 0.68,

    gravity: 2.4,
    turbulence: 0.035,
    drag: 0.24,

    fragmentDistance: 1800,

    tailOpacity: 0.9,
    tailFadeCurve: 1.15,

    seed: 911,
  },

  atmospheric: {
    dissolveStart: 0.70,
    erosion: 0.67,
    cohesion: 0.74,

    gravity: 1.65,
    turbulence: 0.14,
    drag: 0.18,

    fragmentDistance: 2200,

    tailOpacity: 0.62,
    tailFadeCurve: 0.8,

    seed: 404,
  },
} satisfies Record<string, PhysicsConfig>;

export type PhysicsPresetName = keyof typeof physicsPresets;

export const defaultPhysicsPreset: PhysicsPresetName = 'heavy-gravity';
