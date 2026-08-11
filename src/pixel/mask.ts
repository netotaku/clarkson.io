import type { PixelMask, TailConfig } from './types';

export const heroMask: PixelMask = {
  "name": "hero",
  "referenceColumns": 60,
  "referenceRows": 30,
  "off": []
};

export const tailConfig: TailConfig = {
  enabled: true,
  height: 1100,
  density: 0.035,
  clusterStrength: 0.72,
  endOpacity: 0.03,
  seed: 42,
};
