export type PixelMask = {
  name: string;
  referenceColumns: number;
  referenceRows: number;
  off: Array<[number, number]>;
};

export type TailConfig = {
  enabled: boolean;
  height: number;
  density: number;
  clusterStrength: number;
  endOpacity: number;
  seed: number;
};
