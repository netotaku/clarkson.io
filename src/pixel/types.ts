export type PhysicsConfig = {
  /**
   * Normalised vertical point in the top field where erosion begins.
   * 0 = top, 1 = bottom.
   */
  dissolveStart: number;

  /**
   * Higher = more cells detach from the lower part of the hero.
   */
  erosion: number;

  /**
   * Higher = neighbouring pixels tend to survive together in larger chunks.
   */
  cohesion: number;

  /**
   * Downward acceleration used when calculating the final fragment position.
   * This is not animated; it is used once during layout generation.
   */
  gravity: number;

  /**
   * Horizontal drift variation.
   */
  turbulence: number;

  /**
   * Dampens horizontal velocity.
   */
  drag: number;

  /**
   * Maximum vertical distance, in CSS pixels, that detached fragments may travel.
   */
  fragmentDistance: number;

  /**
   * Overall opacity multiplier for detached fragments.
   */
  tailOpacity: number;

  /**
   * Controls how quickly fragments lose opacity with travel distance.
   */
  tailFadeCurve: number;

  /**
   * Deterministic seed.
   */
  seed: number;
};
